/**
 * POST /api/services/enroll/complete
 *
 * ปิดจบผู้เรียนรายคน แล้วออกใบรับรองลงตารางของ SkillChain
 *
 * ลำดับ
 *   1. ตรวจสิทธิ์แอดมินหน่วยวิจัย
 *   2. อัปเดต enrollments → status completed + คะแนน + ผ่าน/ไม่ผ่าน
 *   3. ถ้าผ่าน และผู้เรียนมีบัญชี SkillChain → เรียก RPC ออกใบรับรอง
 *
 * ทำไมต้องผ่าน RPC: skc_student_credentials มี RLS ปิดการเขียนจาก anon
 * (ถูกแล้ว เพราะเป็นข้อมูลของ SkillChain) ฟังก์ชัน skc_issue_rmutl_credential
 * เป็น SECURITY DEFINER ที่ตรวจ apos_is_admin() ก่อน จึงต้องส่ง Bearer token
 * ของแอดมินที่ล็อกอิน Supabase Auth ไปด้วย — แอดมินที่ใช้รหัสผ่าน legacy
 * อย่างเดียวจะปิดจบได้แต่ออกใบรับรองไม่ได้ และ response จะบอกเหตุผลไว้
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authorizeAdminRequest, extractAdminInputs } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const inputs = await extractAdminInputs(request);
  const admin = await authorizeAdminRequest(request);
  if (!admin.authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { enrollment_id, total_score, passed = true, certificate_number } = body || {};
  if (!enrollment_id) {
    return NextResponse.json({ error: 'ต้องระบุ enrollment_id' }, { status: 400 });
  }

  // ── ดึง enrollment พร้อมระดับใบรับรองที่หลักสูตรนี้ให้ ──
  const { data: enr, error: enrErr } = await supabase
    .from('enrollments')
    .select(`
      id, tracking_code, status, skc_user_id, trainee_id,
      training_sessions ( id, training_courses ( title_th, grants_credential_level, skill_domain ) )
    `)
    .eq('id', enrollment_id)
    .single();

  if (enrErr || !enr) {
    return NextResponse.json({ error: 'ไม่พบการลงทะเบียนนี้' }, { status: 404 });
  }

  const course = (enr as any).training_sessions?.training_courses;

  const { error: updErr } = await supabase
    .from('enrollments')
    .update({
      status: passed ? 'completed' : 'failed',
      passed,
      total_score: total_score ?? null,
      certificate_number: certificate_number ?? null,
    })
    .eq('id', enrollment_id);

  if (updErr) {
    return NextResponse.json({ error: `บันทึกผลไม่สำเร็จ: ${updErr.message}` }, { status: 500 });
  }

  // ── ออกใบรับรองเมื่อผ่าน และผูกกับบัญชี SkillChain แล้วเท่านั้น ──
  let credential: any = null;
  let credential_skipped: string | null = null;

  if (!passed) {
    credential_skipped = 'ไม่ผ่านเกณฑ์ จึงไม่ออกใบรับรอง';
  } else if (!enr.skc_user_id) {
    credential_skipped = 'ผู้เรียนยังไม่มีบัญชี SkillChain — ให้สมัครที่ skillchain-rmutl.vercel.app ก่อน แล้วปิดจบซ้ำอีกครั้ง';
  } else if (!course?.grants_credential_level) {
    credential_skipped = 'หลักสูตรนี้ไม่ได้กำหนด grants_credential_level ไว้';
  } else if (!inputs.accessToken) {
    credential_skipped = 'ออกใบรับรองต้องใช้แอดมินที่ล็อกอิน Supabase Auth (รหัสผ่าน legacy ไม่พอ) — บันทึกผลเรียบร้อยแล้ว ล็อกอินใหม่แล้วปิดจบซ้ำได้';
  } else {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // ใช้ token ของแอดมิน เพื่อให้ apos_is_admin() ใน RPC มองเห็นตัวตนจริง
    const asAdmin = createClient(url, anon, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${inputs.accessToken}` } },
    });

    // หาอีเมลผู้เรียนจาก skc_users (SkillChain เป็นเจ้าของข้อมูลคน)
    const { data: student } = await supabase
      .from('skc_users')
      .select('email')
      .eq('id', enr.skc_user_id)
      .single();

    if (!student?.email) {
      credential_skipped = 'ไม่พบอีเมลของผู้เรียนใน skc_users';
    } else {
      const { data: issued, error: rpcErr } = await asAdmin.rpc('skc_issue_rmutl_credential', {
        p_email: student.email,
        p_credential_level: course.grants_credential_level,
        p_certificate_ref: enr.tracking_code,
        p_specialization: course.skill_domain ?? course.title_th ?? null,
      });
      if (rpcErr) {
        credential_skipped = `ออกใบรับรองไม่สำเร็จ: ${rpcErr.message}`;
      } else {
        credential = Array.isArray(issued) ? issued[0] : issued;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    enrollment_id,
    status: passed ? 'completed' : 'failed',
    credential,
    credential_skipped,
  });
}
