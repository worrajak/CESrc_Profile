import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, TabStopPosition, TabStopType,
  BorderStyle, convertMillimetersToTwip
} from 'docx';

interface PubWithRole {
  author_role: string;
  author_order: number;
  is_corresponding: boolean;
  publications: {
    id: string;
    title: string;
    authors_raw: string;
    journal_name: string | null;
    volume: string | null;
    issue: string | null;
    pages: string | null;
    year: number;
    doi: string | null;
    pub_type: string;
  };
}

function formatIEEE(pub: PubWithRole['publications'], idx: number): string {
  const parts: string[] = [];
  parts.push(`[${idx}]`);
  parts.push(pub.authors_raw);
  const isBook = pub.pub_type === 'book' || pub.pub_type === 'book_chapter';
  parts.push(isBook ? pub.title : `"${pub.title}"`);
  if (pub.journal_name) parts.push(pub.journal_name);
  if (pub.volume) {
    let vol = `vol. ${pub.volume}`;
    if (pub.issue) vol += `, no. ${pub.issue}`;
    parts.push(vol);
  }
  if (pub.pages) parts.push(pub.pages.startsWith('pp.') ? pub.pages : `pp. ${pub.pages}`);
  parts.push(pub.year.toString());
  if (pub.doi) parts.push(`doi: ${pub.doi}`);
  return parts.join(', ') + '.';
}

function formatAPA(pub: PubWithRole['publications']): string {
  // Convert authors to APA format
  const raw = pub.authors_raw
    .replace(/,?\s+and\s+/gi, ', ')
    .replace(/,?\s+&\s+/gi, ', ');
  const authorNames = raw.split(/,\s*/).filter(s => s.trim());
  const apaNames = authorNames.map(name => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      const initial = parts[0];
      const surname = parts.slice(1).join(' ');
      if (initial.endsWith('.')) return `${surname}, ${initial}`;
      return `${surname}, ${initial.charAt(0)}.`;
    }
    return name;
  });

  let authorStr = '';
  if (apaNames.length === 1) authorStr = apaNames[0];
  else if (apaNames.length === 2) authorStr = `${apaNames[0]} & ${apaNames[1]}`;
  else authorStr = apaNames.slice(0, -1).join(', ') + ', & ' + apaNames[apaNames.length - 1];

  const parts = [authorStr, `(${pub.year}).`, `${pub.title}.`];
  if (pub.journal_name) {
    let src = pub.journal_name;
    if (pub.volume) {
      src += `, ${pub.volume}`;
      if (pub.issue) src += `(${pub.issue})`;
    }
    if (pub.pages) src += `, ${pub.pages}`;
    parts.push(src + '.');
  }
  if (pub.doi) parts.push(`https://doi.org/${pub.doi}`);
  return parts.join(' ');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const format = request.nextUrl.searchParams.get('format') || 'ieee';
  const researcherId = params.id;

  // Fetch researcher
  const { data: researcher, error: rErr } = await supabase
    .from('researchers')
    .select('*')
    .eq('id', researcherId)
    .single();

  if (rErr || !researcher) {
    return NextResponse.json({ error: 'Researcher not found' }, { status: 404 });
  }

  // Fetch publications with roles
  const { data: publications } = await supabase
    .from('publication_authors')
    .select(`
      author_role, author_order, is_corresponding,
      publications (*)
    `)
    .eq('researcher_id', researcherId)
    .order('author_order', { ascending: true });

  // Fetch grants
  const { data: grants } = await supabase
    .from('grant_members')
    .select(`role, grants (*)`)
    .eq('researcher_id', researcherId);

  const r = researcher;
  const fullNameTh = `${r.title_th}${r.first_name_th} ${r.last_name_th}`;
  const fullNameEn = r.first_name_en ? `${r.title_en || ''} ${r.first_name_en} ${r.last_name_en || ''}`.trim() : '';

  const isIEEE = format === 'ieee';
  const fontName = isIEEE ? 'Times New Roman' : 'Arial';

  // Build document sections
  const children: Paragraph[] = [];

  // Title
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Curriculum Vitae', bold: true, font: fontName, size: 32 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }));

  // Name
  children.push(new Paragraph({
    children: [new TextRun({ text: fullNameTh, bold: true, font: fontName, size: 28 })],
    alignment: AlignmentType.CENTER,
  }));
  if (fullNameEn) {
    children.push(new Paragraph({
      children: [new TextRun({ text: fullNameEn, font: fontName, size: 24 })],
      alignment: AlignmentType.CENTER,
    }));
  }

  // Position & Affiliation
  children.push(new Paragraph({
    children: [new TextRun({ text: `${r.department}, ${r.faculty}`, font: fontName, size: 22 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: `${r.university}, ${r.campus}`, font: fontName, size: 22 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
  }));

  // Separator
  children.push(new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' } },
    spacing: { after: 200 },
  }));

  // Expertise
  if (r.expertise && r.expertise.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Research Expertise', bold: true, font: fontName, size: 24 })],
      spacing: { before: 200, after: 100 },
    }));
    r.expertise.forEach((exp: string) => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `• ${exp}`, font: fontName, size: 22 })],
        indent: { left: convertMillimetersToTwip(10) },
      }));
    });
  }

  // Publications
  const pubs = (publications || []) as unknown as PubWithRole[];
  if (pubs.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({
        text: `Publications (${pubs.length})`,
        bold: true, font: fontName, size: 24,
      })],
      spacing: { before: 300, after: 100 },
    }));

    // Group by role
    const roleGroups: Record<string, PubWithRole[]> = {
      first_author: [], corresponding_author: [], co_author: [], last_author: [],
    };
    pubs.forEach(p => {
      const key = p.author_role || 'co_author';
      if (!roleGroups[key]) roleGroups[key] = [];
      roleGroups[key].push(p);
    });

    const roleLabels: Record<string, string> = {
      first_author: 'As First Author',
      corresponding_author: 'As Corresponding Author',
      co_author: 'As Co-Author',
      last_author: 'As Last/Senior Author',
    };

    let pubIdx = 1;
    for (const [role, items] of Object.entries(roleGroups)) {
      if (items.length === 0) continue;
      children.push(new Paragraph({
        children: [new TextRun({
          text: roleLabels[role] || role,
          bold: true, italics: true, font: fontName, size: 22,
        })],
        spacing: { before: 200, after: 100 },
        indent: { left: convertMillimetersToTwip(5) },
      }));

      items.forEach(pa => {
        const pub = pa.publications;
        if (!pub) return;
        const citation = isIEEE ? formatIEEE(pub, pubIdx) : formatAPA(pub);
        children.push(new Paragraph({
          children: [new TextRun({ text: citation, font: fontName, size: 22 })],
          spacing: { after: 100 },
          indent: { left: convertMillimetersToTwip(10), hanging: convertMillimetersToTwip(10) },
        }));
        pubIdx++;
      });
    }
  }

  // Grants
  const grantList = (grants || []) as any[];
  if (grantList.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({
        text: `Research Grants (${grantList.length})`,
        bold: true, font: fontName, size: 24,
      })],
      spacing: { before: 300, after: 100 },
    }));

    grantList.forEach((gm, i) => {
      const g = gm.grants;
      if (!g) return;
      const roleMap: Record<string, string> = { pi: 'PI', co_pi: 'Co-PI', researcher: 'Researcher', consultant: 'Consultant' };
      const budgetStr = g.budget ? ` (${Number(g.budget).toLocaleString()} THB)` : '';
      children.push(new Paragraph({
        children: [new TextRun({
          text: `${i + 1}. ${g.title_th}${budgetStr}`,
          font: fontName, size: 22,
        })],
        spacing: { after: 50 },
        indent: { left: convertMillimetersToTwip(5) },
      }));
      children.push(new Paragraph({
        children: [new TextRun({
          text: `   แหล่งทุน: ${g.funding_agency} | Role: ${roleMap[gm.role] || gm.role}`,
          font: fontName, size: 20, color: '666666',
        })],
        indent: { left: convertMillimetersToTwip(10) },
        spacing: { after: 100 },
      }));
    });
  }

  // Disclaimer
  children.push(new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: '999999' } },
    spacing: { before: 400, after: 100 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({
      text: 'หมายเหตุ: แสดงเฉพาะผลงานที่ผ่านการยืนยันจากฐานข้อมูลวิชาการ (Scopus, Web of Science, DOI)',
      font: fontName, size: 18, italics: true, color: '888888',
    })],
  }));
  children.push(new Paragraph({
    children: [new TextRun({
      text: `Generated: ${new Date().toISOString().split('T')[0]} | Format: ${format.toUpperCase()} | CESRU - RMUTL`,
      font: fontName, size: 18, color: '888888',
    })],
  }));

  // Create document
  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);
  const safeName = (r.last_name_en || r.last_name_th).replace(/\s+/g, '_');
  const filename = `CV_${safeName}_${format.toUpperCase()}.docx`;

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
