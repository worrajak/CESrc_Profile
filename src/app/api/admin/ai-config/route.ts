import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * AI Config API — CRUD ตั้งค่า AI Provider + API Key ผ่านหน้า Admin
 * GET  → ดึง config ทั้งหมด (ซ่อน API Key บางส่วน)
 * POST → บันทึก/อัพเดท config
 */

// ซ่อน API Key แสดงแค่ 6 ตัวแรก + ****
function maskApiKey(key: string | null): string {
  if (!key) return '';
  if (key.length <= 8) return '****';
  return key.substring(0, 6) + '****' + key.substring(key.length - 4);
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ai_config')
      .select('*')
      .order('provider');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mask API keys for security
    const configs = (data || []).map((c: any) => ({
      ...c,
      api_key_masked: maskApiKey(c.api_key),
      has_api_key: !!c.api_key,
      api_key: undefined, // ไม่ส่ง key จริงกลับ
    }));

    return NextResponse.json({ configs });
  } catch (err) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, api_key, api_endpoint, model_name, is_active, is_default } = body;

    if (!provider) {
      return NextResponse.json({ error: 'กรุณาระบุ provider' }, { status: 400 });
    }

    // ถ้าตั้งเป็น default ต้อง reset ตัวอื่นก่อน
    if (is_default) {
      await supabase
        .from('ai_config')
        .update({ is_default: false })
        .neq('provider', provider);
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // อัพเดท api_key เฉพาะเมื่อส่งมาจริง (ไม่ใช่ค่าว่าง)
    if (api_key !== undefined && api_key !== '') {
      updateData.api_key = api_key;
    }
    if (api_endpoint !== undefined) updateData.api_endpoint = api_endpoint;
    if (model_name !== undefined) updateData.model_name = model_name;
    if (body.models !== undefined) updateData.models = body.models;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_default !== undefined) updateData.is_default = is_default;

    const { data, error } = await supabase
      .from('ai_config')
      .update(updateData)
      .eq('provider', provider)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      config: {
        ...data,
        api_key_masked: maskApiKey(data.api_key),
        has_api_key: !!data.api_key,
        api_key: undefined,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

// DELETE — ลบ API Key ออก
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: 'กรุณาระบุ provider' }, { status: 400 });
    }

    const { error } = await supabase
      .from('ai_config')
      .update({
        api_key: null,
        is_active: false,
        is_default: false,
        updated_at: new Date().toISOString(),
      })
      .eq('provider', provider);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `ลบ API Key ของ ${provider} แล้ว` });
  } catch (err) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
