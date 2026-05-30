'use client';

/**
 * PDF extraction — hybrid text + vision fallback
 * ──────────────────────────────────────────────
 * 1. Try `pdfjs-dist` to extract embedded text from every page.
 *    Most modern grant announcements (saved from Word / digital PDF)
 *    have a text layer, so this returns clean Thai/English text
 *    cheaply, with no AI cost.
 * 2. If the text layer is empty or shorter than MIN_TEXT_LEN (scanned
 *    image-only PDF), render the FIRST page to a canvas and return
 *    a PNG data URL the caller can hand to the vision endpoint.
 *
 * pdfjs is lazy-loaded so the ~500 KB library only ships when a user
 * actually uploads a PDF — keeps the initial bundle lean.
 */

const MIN_TEXT_LEN = 100;
const RENDER_SCALE = 1.5; // Higher = clearer image for vision, larger payload

export type PDFExtractResult =
  | { kind: 'text'; text: string; pages: number }
  | { kind: 'image'; imageBase64: string; imageMime: 'image/png'; pages: number; preview: string };

export async function extractFromPDF(file: File, opts?: { signal?: AbortSignal }): Promise<PDFExtractResult> {
  if (opts?.signal?.aborted) throw new Error('aborted');

  const pdfjs: any = await import('pdfjs-dist');
  // Worker is loaded from a CDN — saves us from bundling/copying a ~700 KB
  // worker script into /public. Falls back to module worker if CDN blocks.
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  if (opts?.signal?.aborted) throw new Error('aborted');

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  // ── Step 1: text extraction ──
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    if (opts?.signal?.aborted) throw new Error('aborted');
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .map((it: any) => ('str' in it ? it.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) fullText += pageText + '\n\n';
  }

  if (fullText.trim().length >= MIN_TEXT_LEN) {
    return { kind: 'text', text: fullText.trim(), pages: pdf.numPages };
  }

  // ── Step 2: fallback to vision (render first page) ──
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: RENDER_SCALE });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  await page.render({ canvasContext: ctx, viewport }).promise;

  // toDataURL returns "data:image/png;base64,..." — we split into mime + raw
  const dataUrl = canvas.toDataURL('image/png');
  const base64 = dataUrl.split(',')[1] || '';

  return {
    kind: 'image',
    imageBase64: base64,
    imageMime: 'image/png',
    pages: pdf.numPages,
    preview: dataUrl,
  };
}
