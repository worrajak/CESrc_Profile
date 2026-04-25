/**
 * GET /api/admin/openrouter-models
 * ดึง model list จาก OpenRouter API (public endpoint)
 * คืนค่า: array ของ models เรียง free ก่อน
 *
 * POST /api/admin/openrouter-models
 * บันทึก model list ที่เลือกลง ai_config.models
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
  architecture?: {
    modality?: string;
    input_modalities?: string[];
  };
  top_provider?: {
    is_moderated?: boolean;
  };
  description?: string;
}

export async function GET() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Accept: 'application/json' },
      // Cache 5 mins on Vercel edge
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenRouter API returned ${res.status}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const models: OpenRouterModel[] = data.data || [];

    // Categorize
    const free = models.filter((m) =>
      m.id.includes(':free') ||
      (m.pricing && m.pricing.prompt === '0' && m.pricing.completion === '0')
    );
    const paid = models.filter((m) => !free.includes(m));

    // Helper to format model info
    const format = (m: OpenRouterModel) => {
      const promptCost = parseFloat(m.pricing?.prompt || '0');
      const completionCost = parseFloat(m.pricing?.completion || '0');
      const isFree = promptCost === 0 && completionCost === 0;
      const pricePerMTok = isFree ? 'FREE' :
        `$${(promptCost * 1_000_000).toFixed(2)}/$${(completionCost * 1_000_000).toFixed(2)} per M`;
      const hasVision = m.architecture?.input_modalities?.includes('image') ||
        m.architecture?.modality?.includes('image');

      return {
        id: m.id,
        name: m.name || m.id,
        is_free: isFree,
        price: pricePerMTok,
        context_length: m.context_length || 0,
        has_vision: !!hasVision,
        provider: m.id.split('/')[0] || 'unknown',
      };
    };

    // Sort free models: alphabetical
    const freeModels = free.map(format).sort((a, b) => a.id.localeCompare(b.id));

    // Sort paid: by price ascending (cheapest first), then alphabetical
    const paidModels = paid.map(format).sort((a, b) => {
      const aPrice = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 999;
      const bPrice = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 999;
      if (aPrice !== bPrice) return aPrice - bPrice;
      return a.id.localeCompare(b.id);
    });

    return NextResponse.json({
      total: models.length,
      free_count: freeModels.length,
      paid_count: paidModels.length,
      free: freeModels,
      paid: paidModels,
      // Combined: free first, then paid
      all: [...freeModels, ...paidModels],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch OpenRouter models' },
      { status: 500 }
    );
  }
}

// POST — save selected models to ai_config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { models, replace = false } = body;

    if (!Array.isArray(models)) {
      return NextResponse.json({ error: 'models must be array' }, { status: 400 });
    }

    let updateModels = models;

    // If not replacing, merge with existing
    if (!replace) {
      const { data: existing } = await supabase
        .from('ai_config')
        .select('models')
        .eq('provider', 'openrouter')
        .single();

      if (existing?.models) {
        const existingArr = Array.isArray(existing.models) ? existing.models : [];
        const merged = Array.from(new Set([...existingArr, ...models]));
        updateModels = merged;
      }
    }

    const { error } = await supabase
      .from('ai_config')
      .update({ models: updateModels, updated_at: new Date().toISOString() })
      .eq('provider', 'openrouter');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: updateModels.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
