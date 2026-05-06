import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { getServerLocale, st } from '@/lib/i18n-server';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getServerLocale();
  return {
    title: locale === 'en' ? 'Research Grants | CESRU - RMUTL' : 'ทุนวิจัย | CESRU - RMUTL',
    description: locale === 'en'
      ? 'Research grants and projects of CESRU, RMUTL'
      : 'ทุนวิจัยและโครงการวิจัยของหน่วยวิจัยระบบพลังงานสะอาด มทร.ล้านนา',
  };
}

export default async function GrantsPage() {
  const { data: grants } = await supabase
    .from('grants')
    .select(`
      *,
      grant_members (
        role,
        researchers (
          id, title_th, first_name_th, last_name_th, avatar_url
        )
      )
    `)
    .order('fiscal_year', { ascending: false });

  // Try to get tracking data (may fail if tables don't exist yet)
  let trackingMap: Record<string, any> = {};
  try {
    const { data: milestoneStats } = await supabase
      .from('grant_milestones')
      .select('grant_id, status, completion_pct');

    const { data: progressLogs } = await supabase
      .from('grant_progress_logs')
      .select('grant_id, log_date, planned_pct, actual_pct')
      .order('log_date', { ascending: false });

    if (milestoneStats) {
      for (const ms of milestoneStats) {
        if (!trackingMap[ms.grant_id]) {
          trackingMap[ms.grant_id] = { total: 0, completed: 0, delayed: 0, avgPct: 0, sumPct: 0 };
        }
        trackingMap[ms.grant_id].total++;
        trackingMap[ms.grant_id].sumPct += (ms.completion_pct || 0);
        if (ms.status === 'completed') trackingMap[ms.grant_id].completed++;
        if (ms.status === 'delayed') trackingMap[ms.grant_id].delayed++;
      }
      for (const gid of Object.keys(trackingMap)) {
        trackingMap[gid].avgPct = trackingMap[gid].total > 0
          ? Math.round(trackingMap[gid].sumPct / trackingMap[gid].total) : 0;
      }
    }

    // Latest progress per grant
    if (progressLogs) {
      const seen = new Set<string>();
      for (const pl of progressLogs) {
        if (!seen.has(pl.grant_id)) {
          seen.add(pl.grant_id);
          if (!trackingMap[pl.grant_id]) trackingMap[pl.grant_id] = {};
          trackingMap[pl.grant_id].latestPlanned = pl.planned_pct;
          trackingMap[pl.grant_id].latestActual = pl.actual_pct;
        }
      }
    }
  } catch {
    // Tables might not exist yet
  }

  const allGrants = grants || [];
  const activeGrants = allGrants.filter((g: any) => g.status === 'active');
  const completedGrants = allGrants.filter((g: any) => g.status === 'completed');
  const otherGrants = allGrants.filter((g: any) => g.status !== 'active' && g.status !== 'completed');
  const totalBudget = allGrants.reduce((sum: number, g: any) => sum + (Number(g.budget) || 0), 0);

  const locale = getServerLocale();

  const statusBorderColor: Record<string, string> = {
    active: 'border-blue-400',
    completed: 'border-green-400',
    pending: 'border-yellow-400',
    cancelled: 'border-red-400',
  };
  const statusBgColor: Record<string, string> = {
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const renderGrantCard = (g: any) => {
    const tracking = trackingMap[g.id];
    const statusLabel = st(`grants.status.${g.status}`, locale);
    const borderColor = statusBorderColor[g.status] || statusBorderColor.active;
    const bgColor = statusBgColor[g.status] || statusBgColor.active;
    const primaryTitle = locale === 'en' && g.title_en ? g.title_en : g.title_th;
    const secondaryTitle = locale === 'en' && g.title_en ? g.title_th : g.title_en;

    return (
      <Link key={g.id} href={`/grants/${g.id}`} className="block group">
        <div className={`bg-white rounded-xl shadow-sm border-l-4 ${borderColor} p-5 hover:shadow-lg transition-all`}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition line-clamp-2">{primaryTitle}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${bgColor}`}>{statusLabel}</span>
          </div>

          {secondaryTitle && <p className="text-xs text-gray-400 mb-3 line-clamp-1">{secondaryTitle}</p>}

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
            <div>
              <span className="text-gray-400">{st('grants.funding_agency', locale)}</span>
              <div className="font-medium text-gray-800">{g.funding_agency}</div>
            </div>
            {g.budget && (
              <div>
                <span className="text-gray-400">{st('grants.budget', locale)}</span>
                <div className="font-semibold text-green-700">{Number(g.budget).toLocaleString()} {locale === 'en' ? 'THB' : 'บาท'}</div>
              </div>
            )}
            {g.fiscal_year && (
              <div>
                <span className="text-gray-400">{st('grants.fiscal_year', locale)}</span>
                <div className="font-medium">{locale === 'en' ? `BE ${g.fiscal_year}` : `พ.ศ. ${g.fiscal_year}`}</div>
              </div>
            )}
            {(g.start_date || g.end_date) && (
              <div>
                <span className="text-gray-400">{st('grants.duration', locale)}</span>
                <div className="font-medium">{g.start_date || '?'} — {g.end_date || '?'}</div>
              </div>
            )}
          </div>

          {/* Tracking Progress */}
          {tracking && tracking.total > 0 && (
            <div className="mb-3 pt-3 border-t">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">{locale === 'en' ? 'Progress' : 'ความก้าวหน้า'}</span>
                <span className="font-bold text-blue-700">{tracking.avgPct}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${
                  tracking.avgPct >= 100 ? 'bg-green-500' :
                  tracking.delayed > 0 ? 'bg-orange-500' : 'bg-blue-500'
                }`} style={{ width: `${Math.min(tracking.avgPct, 100)}%` }} />
              </div>
              <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
                <span>Milestones: {tracking.completed}/{tracking.total}</span>
                {tracking.delayed > 0 && <span className="text-red-500">{locale === 'en' ? `Delayed: ${tracking.delayed}` : `ล่าช้า: ${tracking.delayed}`}</span>}
              </div>
            </div>
          )}

          {/* Team */}
          {g.grant_members && g.grant_members.length > 0 && (
            <div className="flex items-center gap-1 pt-3 border-t">
              <div className="flex -space-x-2">
                {g.grant_members.slice(0, 4).map((gm: any, i: number) => {
                  const r = gm.researchers;
                  if (!r) return null;
                  return r.avatar_url ? (
                    <img key={i} src={r.avatar_url} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                  ) : (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[9px] text-blue-700 font-bold">
                      {r.first_name_th?.[0]}
                    </div>
                  );
                })}
                {g.grant_members.length > 4 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] text-gray-500">
                    +{g.grant_members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 ml-2">
                {g.grant_members.find((gm: any) => gm.role === 'pi')?.researchers
                  ? `${g.grant_members.find((gm: any) => gm.role === 'pi').researchers.title_th}${g.grant_members.find((gm: any) => gm.role === 'pi').researchers.first_name_th}`
                  : ''
                }
              </span>
            </div>
          )}

          {/* Research areas */}
          {g.research_areas && g.research_areas.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {g.research_areas.slice(0, 3).map((area: string, i: number) => (
                <span key={i} className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded">{area}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{st('grants.page_title', locale)}</h1>
        <p className="text-gray-500">
          {st('grants.page_subtitle', locale)} ({allGrants.length})
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <div className="text-3xl font-bold text-gray-800">{allGrants.length}</div>
          <div className="text-sm text-gray-500">{locale === 'en' ? 'Total Grants' : 'โครงการทั้งหมด'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <div className="text-3xl font-bold text-blue-600">{activeGrants.length}</div>
          <div className="text-sm text-gray-500">{st('grants.section.active', locale)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border">
          <div className="text-3xl font-bold text-green-600">{completedGrants.length}</div>
          <div className="text-sm text-gray-500">{st('grants.section.completed', locale)}</div>
        </div>
        {totalBudget > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 border">
            <div className="text-2xl font-bold text-green-700">{(totalBudget / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-500">
              {locale === 'en' ? `Total Budget (${totalBudget.toLocaleString()} THB)` : `งบรวม (${totalBudget.toLocaleString()} บาท)`}
            </div>
          </div>
        )}
      </div>

      {/* Active Grants */}
      {activeGrants.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            {st('grants.section.active', locale)} ({activeGrants.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGrants.map(renderGrantCard)}
          </div>
        </div>
      )}

      {/* Completed Grants */}
      {completedGrants.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            {st('grants.section.completed', locale)} ({completedGrants.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGrants.map(renderGrantCard)}
          </div>
        </div>
      )}

      {/* Other Grants */}
      {otherGrants.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{st('grants.section.other', locale)} ({otherGrants.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherGrants.map(renderGrantCard)}
          </div>
        </div>
      )}
    </div>
  );
}
