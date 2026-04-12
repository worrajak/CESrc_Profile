/**
 * API: Grant Tracking — CRUD milestones, deliverables, progress, alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grantId = searchParams.get('grant_id');
  const type = searchParams.get('type') || 'all'; // milestones, deliverables, progress, alerts, all

  if (!grantId) {
    return NextResponse.json({ error: 'grant_id required' }, { status: 400 });
  }

  const result: any = {};

  if (type === 'all' || type === 'milestones') {
    const { data } = await supabase
      .from('grant_milestones')
      .select('*, grant_deliverables(*)')
      .eq('grant_id', grantId)
      .order('sort_order')
      .order('planned_date');
    result.milestones = data || [];
  }

  if (type === 'all' || type === 'progress') {
    const { data } = await supabase
      .from('grant_progress_logs')
      .select('*')
      .eq('grant_id', grantId)
      .order('log_date');
    result.progress = data || [];
  }

  if (type === 'all' || type === 'alerts') {
    const { data } = await supabase
      .from('grant_alerts')
      .select('*')
      .eq('grant_id', grantId)
      .order('created_at', { ascending: false })
      .limit(20);
    result.alerts = data || [];
  }

  if (type === 'all' || type === 'scurve') {
    // สร้าง S-Curve data: planned vs actual ทุกเดือน
    const { data: grant } = await supabase
      .from('grants')
      .select('start_date, end_date')
      .eq('id', grantId)
      .single();

    const { data: logs } = await supabase
      .from('grant_progress_logs')
      .select('log_date, planned_pct, actual_pct')
      .eq('grant_id', grantId)
      .order('log_date');

    result.scurve = {
      start_date: grant?.start_date,
      end_date: grant?.end_date,
      data_points: logs || [],
    };
  }

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, grant_id, ...payload } = body;

    switch (action) {
      case 'add_milestone': {
        const { data, error } = await supabase.from('grant_milestones').insert({
          grant_id,
          ...payload,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ milestone: data });
      }

      case 'update_milestone': {
        const { id, ...updates } = payload;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from('grant_milestones')
          .update(updates).eq('id', id).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Auto-generate alert if delayed
        if (updates.status === 'delayed') {
          await supabase.from('grant_alerts').insert({
            grant_id,
            milestone_id: id,
            alert_type: 'warning',
            title: `Milestone ล่าช้า: ${data.title}`,
            message: `Milestone "${data.title}" มีสถานะล่าช้ากว่าแผน`,
          });
        }
        if (updates.status === 'completed') {
          await supabase.from('grant_alerts').insert({
            grant_id,
            milestone_id: id,
            alert_type: 'success',
            title: `Milestone สำเร็จ: ${data.title}`,
            message: `Milestone "${data.title}" ดำเนินการเสร็จสิ้น`,
          });
        }

        return NextResponse.json({ milestone: data });
      }

      case 'delete_milestone': {
        const { error } = await supabase.from('grant_milestones')
          .delete().eq('id', payload.id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }

      case 'add_deliverable': {
        const { data, error } = await supabase.from('grant_deliverables').insert({
          grant_id,
          ...payload,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ deliverable: data });
      }

      case 'update_deliverable': {
        const { id: dId, ...dUpdates } = payload;
        const { data, error } = await supabase.from('grant_deliverables')
          .update(dUpdates).eq('id', dId).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ deliverable: data });
      }

      case 'log_progress': {
        const { data, error } = await supabase.from('grant_progress_logs').upsert({
          grant_id,
          ...payload,
        }, { onConflict: 'grant_id,log_date' }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Auto alert if behind schedule
        if (payload.planned_pct && payload.actual_pct) {
          const diff = payload.planned_pct - payload.actual_pct;
          if (diff > 20) {
            await supabase.from('grant_alerts').insert({
              grant_id,
              alert_type: 'danger',
              title: 'ความก้าวหน้าต่ำกว่าแผนมาก',
              message: `ณ วันที่ ${payload.log_date}: แผน ${payload.planned_pct}% จริง ${payload.actual_pct}% (ต่ำกว่า ${diff.toFixed(1)}%)`,
            });
          } else if (diff > 10) {
            await supabase.from('grant_alerts').insert({
              grant_id,
              alert_type: 'warning',
              title: 'ความก้าวหน้าต่ำกว่าแผน',
              message: `ณ วันที่ ${payload.log_date}: แผน ${payload.planned_pct}% จริง ${payload.actual_pct}% (ต่ำกว่า ${diff.toFixed(1)}%)`,
            });
          }
        }

        return NextResponse.json({ progress: data });
      }

      case 'mark_alert_read': {
        await supabase.from('grant_alerts').update({ is_read: true }).eq('id', payload.id);
        return NextResponse.json({ success: true });
      }

      case 'import_from_ai': {
        // Import milestones & deliverables จากผลลัพธ์ AI parse
        const { milestones, work_plan } = payload;

        if (milestones && milestones.length > 0) {
          for (let i = 0; i < milestones.length; i++) {
            const m = milestones[i];
            const { data: ms } = await supabase.from('grant_milestones').insert({
              grant_id,
              title: m.title,
              description: m.description,
              milestone_type: m.milestone_type || 'deliverable',
              planned_date: m.planned_date,
              planned_weight: m.planned_weight || 0,
              sort_order: i + 1,
            }).select().single();

            if (ms && m.deliverables) {
              for (let j = 0; j < m.deliverables.length; j++) {
                const d = m.deliverables[j];
                await supabase.from('grant_deliverables').insert({
                  grant_id,
                  milestone_id: ms.id,
                  title: d.title,
                  description: d.description,
                  deliverable_type: d.deliverable_type || 'document',
                  planned_date: d.planned_date,
                  sort_order: j + 1,
                });
              }
            }
          }
        }

        // Import work plan as progress baseline
        if (work_plan && work_plan.length > 0) {
          const { data: grant } = await supabase.from('grants')
            .select('start_date').eq('id', grant_id).single();

          if (grant?.start_date) {
            const startDate = new Date(grant.start_date);
            for (const wp of work_plan) {
              const logDate = new Date(startDate);
              logDate.setMonth(logDate.getMonth() + (wp.month - 1));
              const logDateStr = logDate.toISOString().split('T')[0];

              await supabase.from('grant_progress_logs').upsert({
                grant_id,
                log_date: logDateStr,
                planned_pct: wp.planned_pct || 0,
                actual_pct: 0,
                summary: wp.activities?.join(', ') || '',
              }, { onConflict: 'grant_id,log_date' });
            }
          }
        }

        return NextResponse.json({ success: true, message: 'Imported successfully' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
