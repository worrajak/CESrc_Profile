import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateTrackingCode(serviceType: string): string {
  const prefix: Record<string, string> = {
    training: 'TRN',
    consulting: 'CON',
    design_install: 'DSG',
    inspection: 'INS',
  };
  const pfx = prefix[serviceType] || 'SRV';
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${pfx}-${y}${m}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      service_type,
      requester_name,
      requester_org,
      requester_email,
      requester_phone,
      title,
      description,
      num_participants,
      preferred_date_start,
      preferred_date_end,
      location,
      estimated_budget,
      course_code,
    } = body;

    if (!requester_name || !requester_email || !title) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, อีเมล, หัวข้อ)' },
        { status: 400 }
      );
    }

    const tracking_code = generateTrackingCode(service_type);

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        tracking_code,
        service_type: service_type || 'training',
        requester_name,
        requester_org: requester_org || null,
        requester_email,
        requester_phone: requester_phone || null,
        title,
        description: description || null,
        num_participants: num_participants ? parseInt(num_participants) : null,
        preferred_date_start: preferred_date_start || null,
        preferred_date_end: preferred_date_end || null,
        location: location || null,
        estimated_budget: estimated_budget ? parseFloat(estimated_budget) : null,
        course_code: course_code || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'ไม่สามารถบันทึกคำขอได้' }, { status: 500 });
    }

    // Add initial timeline entry
    await supabase.from('service_timeline').insert({
      request_id: data.id,
      status: 'pending',
      note: `คำขอบริการ "${title}" ถูกสร้างโดย ${requester_name}`,
      actor: requester_name,
    });

    return NextResponse.json({
      tracking_code,
      request_id: data.id,
      message: 'บันทึกคำขอสำเร็จ',
    });
  } catch (err) {
    console.error('Request error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
