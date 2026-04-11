import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Enrollment API — ลงทะเบียนอบรม
 * 1. สร้าง/อัพเดท trainee record
 * 2. สร้าง enrollment record
 * 3. สร้าง tracking code
 */

function generateTrackingCode(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ENR-${y}${m}${d}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      session_id,
      trainee_type,
      fee_type,
      fee_amount,
      title_th,
      first_name_th,
      last_name_th,
      first_name_en,
      last_name_en,
      student_id,
      organization,
      email,
      phone,
    } = body;

    // Validation
    if (!session_id || !first_name_th || !last_name_th || !email) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, นามสกุล, อีเมล)' },
        { status: 400 }
      );
    }

    // Check session exists and is open
    const { data: session, error: sessionErr } = await supabase
      .from('training_sessions')
      .select('*, training_courses(code, title_th)')
      .eq('id', session_id)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: 'ไม่พบรุ่นอบรมที่ระบุ' }, { status: 404 });
    }

    if (session.status !== 'open') {
      return NextResponse.json({ error: 'รุ่นนี้ยังไม่เปิดรับสมัครหรือปิดรับแล้ว' }, { status: 400 });
    }

    // Check enrollment count
    const { count: currentCount } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .not('status', 'eq', 'cancelled');

    if (currentCount !== null && currentCount >= session.max_participants) {
      return NextResponse.json({ error: 'รุ่นนี้เต็มแล้ว กรุณาเลือกรุ่นอื่น' }, { status: 400 });
    }

    // Find or create trainee
    let traineeId: string;

    // Try find existing by email
    const { data: existingTrainee } = await supabase
      .from('trainees')
      .select('id')
      .eq('email', email)
      .single();

    if (existingTrainee) {
      traineeId = existingTrainee.id;

      // Update trainee info
      await supabase.from('trainees').update({
        title_th: title_th || undefined,
        first_name_th,
        last_name_th,
        first_name_en: first_name_en || undefined,
        last_name_en: last_name_en || undefined,
        trainee_type: trainee_type || 'public',
        student_id: student_id || undefined,
        organization: organization || undefined,
        phone: phone || undefined,
      }).eq('id', traineeId);
    } else {
      // Create new trainee
      const { data: newTrainee, error: traineeErr } = await supabase
        .from('trainees')
        .insert({
          title_th: title_th || null,
          first_name_th,
          last_name_th,
          first_name_en: first_name_en || null,
          last_name_en: last_name_en || null,
          trainee_type: trainee_type || 'public',
          student_id: student_id || null,
          organization: organization || null,
          email,
          phone: phone || null,
        })
        .select()
        .single();

      if (traineeErr || !newTrainee) {
        console.error('Trainee create error:', traineeErr);
        return NextResponse.json({ error: 'ไม่สามารถสร้างข้อมูลผู้เข้าอบรมได้' }, { status: 500 });
      }

      traineeId = newTrainee.id;
    }

    // Check duplicate enrollment
    const { data: existingEnroll } = await supabase
      .from('enrollments')
      .select('id, tracking_code, status')
      .eq('session_id', session_id)
      .eq('trainee_id', traineeId)
      .single();

    if (existingEnroll) {
      if (existingEnroll.status === 'cancelled') {
        // Re-activate cancelled enrollment
        const trackingCode = generateTrackingCode();
        await supabase.from('enrollments').update({
          status: 'registered',
          tracking_code: trackingCode,
          fee_type: fee_type || 'external',
          fee_amount: fee_amount || 0,
          payment_status: fee_amount > 0 ? 'pending' : 'waived',
        }).eq('id', existingEnroll.id);

        return NextResponse.json({
          tracking_code: trackingCode,
          enrollment_id: existingEnroll.id,
          trainee_id: traineeId,
          message: 'ลงทะเบียนใหม่สำเร็จ (เคยยกเลิกก่อนหน้า)',
        });
      }

      return NextResponse.json({
        error: `คุณลงทะเบียนรุ่นนี้แล้ว (รหัส: ${existingEnroll.tracking_code})`,
        tracking_code: existingEnroll.tracking_code,
      }, { status: 409 });
    }

    // Create enrollment
    const trackingCode = generateTrackingCode();
    const { data: enrollment, error: enrollErr } = await supabase
      .from('enrollments')
      .insert({
        session_id,
        trainee_id: traineeId,
        tracking_code: trackingCode,
        fee_type: fee_type || 'external',
        fee_amount: fee_amount || 0,
        payment_status: (fee_amount || 0) > 0 ? 'pending' : 'waived',
        status: 'registered',
      })
      .select()
      .single();

    if (enrollErr || !enrollment) {
      console.error('Enrollment error:', enrollErr);
      return NextResponse.json({ error: 'ไม่สามารถลงทะเบียนได้' }, { status: 500 });
    }

    return NextResponse.json({
      tracking_code: trackingCode,
      enrollment_id: enrollment.id,
      trainee_id: traineeId,
      session: {
        code: session.session_code,
        course: session.training_courses?.title_th,
        start_date: session.start_date,
        location: session.location,
      },
      fee: {
        type: fee_type,
        amount: fee_amount,
        status: (fee_amount || 0) > 0 ? 'pending' : 'waived',
      },
      message: 'ลงทะเบียนสำเร็จ',
    });
  } catch (err) {
    console.error('Enroll error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
