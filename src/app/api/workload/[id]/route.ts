/**
 * GET /api/workload/[researcher_id]?year=2026
 * คืนข้อมูลภาระงานของนักวิจัยแต่ละท่าน
 * - Publications (total + this year)
 * - Citations, H-index
 * - Grants (total + active)
 * - Official travels (with detail list)
 * - Training courses as instructor
 * - Academic services
 * - Students supervised
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const researcherId = params.id;
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const yearFilter = year ? parseInt(year) : new Date().getFullYear();

  try {
    // Get researcher info
    const { data: researcher, error: rErr } = await supabase
      .from('researchers')
      .select('*')
      .eq('id', researcherId)
      .single();

    if (rErr || !researcher) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Publications (via publication_authors)
    const { data: pubLinks } = await supabase
      .from('publication_authors')
      .select('publication_id, author_role')
      .eq('researcher_id', researcherId);

    const pubIds = (pubLinks || []).map((p) => p.publication_id);
    const { data: publications } = pubIds.length > 0
      ? await supabase
          .from('publications')
          .select('id, title, year, doi, journal_name, pub_type, cited_by_count')
          .in('id', pubIds)
          .order('year', { ascending: false })
      : { data: [] };

    // Grants
    const { data: grantLinks } = await supabase
      .from('grant_members')
      .select('grant_id, role')
      .eq('researcher_id', researcherId);

    const grantIds = (grantLinks || []).map((g) => g.grant_id);
    const { data: grants } = grantIds.length > 0
      ? await supabase
          .from('grants')
          .select('id, title_th, title_en, funding_agency, fiscal_year, budget, start_date, end_date, status')
          .in('id', grantIds)
          .order('fiscal_year', { ascending: false })
      : { data: [] };

    // Official travels — where researcher is author OR listed in participants
    const { data: travels } = await supabase
      .from('news')
      .select('id, title, travel_purpose, travel_location, travel_start_date, travel_end_date, travel_approval_number, travel_approval_doc_url, travel_approval_link, travel_budget, travel_funding_source, travel_activity_type, travel_participants, author_id, cover_image_url')
      .eq('is_official_travel', true)
      .or(`author_id.eq.${researcherId},travel_participants.cs.["${researcherId}"]`)
      .order('travel_start_date', { ascending: false });

    // Filter by year if specified
    const filteredTravels = (travels || []).filter((t: any) => {
      if (!t.travel_start_date) return false;
      return new Date(t.travel_start_date).getFullYear() === yearFilter;
    });

    const allTravelYears: number[] = (travels || [])
      .map((t: any) => t.travel_start_date ? new Date(t.travel_start_date).getFullYear() : null)
      .filter((y: number | null): y is number => y !== null);

    // Calculate total travel days this year
    const travelDaysThisYear = filteredTravels.reduce((sum: number, t: any) => {
      if (!t.travel_start_date) return sum;
      const start = new Date(t.travel_start_date);
      const end = t.travel_end_date ? new Date(t.travel_end_date) : start;
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + Math.max(1, days);
    }, 0);

    // Training courses as instructor
    const { data: courses } = await supabase
      .from('training_courses')
      .select('id, code, title_th, level, duration_hours, duration_days, instructor_id, instructor_ids, is_active')
      .or(`instructor_id.eq.${researcherId},instructor_ids.cs.["${researcherId}"]`);

    // Academic services
    const { data: serviceMembers } = await supabase
      .from('service_members')
      .select('id, role_in_service, service_requests(id, service_type, title, requester_name, location, start_date, end_date, status)')
      .eq('researcher_id', researcherId);

    // Students supervised
    const { data: students } = await supabase
      .from('students')
      .select('id, title_th, first_name_th, last_name_th, degree_level, enrollment_year, graduation_year, status')
      .or(`advisor_id.eq.${researcherId},co_advisors.cs.["${researcherId}"]`);

    // Summary counts
    const pubsThisYear = (publications || []).filter((p: any) => p.year === yearFilter).length;
    const activeGrants = (grants || []).filter((g: any) => g.status === 'active').length;
    const totalCourses = (courses || []).length;
    const totalServices = (serviceMembers || []).length;

    return NextResponse.json({
      researcher: {
        id: researcher.id,
        name_th: `${researcher.title_th}${researcher.first_name_th} ${researcher.last_name_th}`,
        name_en: researcher.first_name_en ? `${researcher.title_en || ''} ${researcher.first_name_en} ${researcher.last_name_en || ''}`.trim() : null,
        unit_role: researcher.unit_role,
        department: researcher.department,
        email: researcher.email,
        orcid_id: researcher.orcid_id,
        openalex_id: researcher.openalex_id,
        cited_by_count: researcher.cited_by_count || 0,
        h_index: researcher.h_index || 0,
        i10_index: researcher.i10_index || 0,
      },
      year: yearFilter,
      available_years: Array.from(new Set(allTravelYears)).sort((a, b) => b - a),
      summary: {
        publications_total: publications?.length || 0,
        publications_this_year: pubsThisYear,
        citations_total: researcher.cited_by_count || 0,
        h_index: researcher.h_index || 0,
        grants_total: grants?.length || 0,
        grants_active: activeGrants,
        travels_this_year: filteredTravels.length,
        travel_days_this_year: travelDaysThisYear,
        travels_all: travels?.length || 0,
        courses_as_instructor: totalCourses,
        academic_services: totalServices,
        students_supervised: students?.length || 0,
      },
      publications: publications || [],
      grants: grants || [],
      travels: filteredTravels,
      all_travels: travels || [],
      courses: courses || [],
      services: serviceMembers || [],
      students: students || [],
    });
  } catch (err: any) {
    console.error('Workload error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
