'use client';

/**
 * CareerPlanView — main container for the "แผนตำแหน่งวิชาการ" tab on
 * /research-plan. Renders:
 *
 *   1. Team overview (sortable list of every active researcher's progress
 *      toward their next academic title) — open to everyone in CESRU.
 *   2. "My plan" detail card (self-service editing) for the logged-in
 *      researcher. Auto-creates a draft plan row on first visit.
 *
 * Phase A scope (this file):
 *   - team overview from cesru_career_team_overview view
 *   - my-plan detail with settings modal + 12-doc checklist
 *   - upload to Supabase Storage OR Drive/OneDrive external link
 *
 * Phase B (later):
 *   - publication linker with FA/CA/Co-author role markers
 *   - external researcher entry / ORCID lookup
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import TeamCareerOverview from './TeamCareerOverview';
import MyCareerPlan from './MyCareerPlan';

export type CareerPlan = {
  id: string;
  researcher_id: string;
  current_position_th: string | null;
  current_position_date: string | null;
  target_position: 'asst_prof' | 'assoc_prof' | 'prof';
  eligibility_window_start: string | null;
  eligibility_window_end: string | null;
  target_submission_date: string | null;
  status: 'draft' | 'preparing' | 'submitted' | 'approved' | 'rejected';
  completion_pct: number;
  approval_threshold: number;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  notes: string | null;
};

export type TeamOverviewRow = {
  researcher_id: string;
  title_th: string | null;
  first_name_th: string;
  last_name_th: string;
  unit_role: string;
  avatar_url: string | null;
  executive_role_th: string | null;
  plan_id: string | null;
  target_position: 'asst_prof' | 'assoc_prof' | 'prof' | null;
  current_position_th: string | null;
  eligibility_window_end: string | null;
  status: CareerPlan['status'] | null;
  completion_pct: number;
  approval_threshold: number | null;
  days_until_deadline: number | null;
  sort_bucket: number;
};

export default function CareerPlanView() {
  const { user, profile } = useAuth();

  const [team, setTeam] = useState<TeamOverviewRow[]>([]);
  const [myPlan, setMyPlan] = useState<CareerPlan | null>(null);
  const [myResearcherId, setMyResearcherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Find the researcher row that matches the logged-in user (by email).
  // Anonymous visitors only see the team overview — no my-plan section.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.email) {
        setMyResearcherId(null);
        return;
      }
      const { data } = await supabase
        .from('researchers')
        .select('id')
        .ilike('email', user.email.toLowerCase())
        .maybeSingle();
      if (!cancelled) setMyResearcherId(data?.id || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  // Fetch team overview + my plan in parallel
  const refresh = async () => {
    setLoading(true);
    const [teamRes, planRes] = await Promise.all([
      supabase
        .from('cesru_career_team_overview')
        .select('*')
        .order('sort_bucket', { ascending: true })
        .order('completion_pct', { ascending: false }),
      myResearcherId
        ? supabase
            .from('academic_position_plans')
            .select('*')
            .eq('researcher_id', myResearcherId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setTeam((teamRes.data as TeamOverviewRow[]) || []);
    setMyPlan((planRes as any).data || null);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // re-fetch when researcher id resolves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myResearcherId]);

  // Quick stats for the header
  const stats = useMemo(() => {
    const total = team.length;
    const withPlan = team.filter((t) => !!t.plan_id).length;
    const critical = team.filter((t) => t.sort_bucket === 1).length;
    return { total, withPlan, critical };
  }, [team]);

  return (
    <div className="space-y-6">
      <TeamCareerOverview
        team={team}
        loading={loading}
        stats={stats}
        currentResearcherId={myResearcherId}
      />

      {myResearcherId ? (
        <MyCareerPlan
          researcherId={myResearcherId}
          plan={myPlan}
          onChanged={refresh}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-500">
            {profile
              ? 'อีเมลของคุณยังไม่ตรงกับรายชื่อนักวิจัยในระบบ — กรุณาให้ admin เพิ่มคุณก่อนจึงจะวางแผนตำแหน่งวิชาการได้'
              : 'เข้าสู่ระบบเพื่อวางแผนตำแหน่งวิชาการของคุณ'}
          </p>
        </div>
      )}
    </div>
  );
}
