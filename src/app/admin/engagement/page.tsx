'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeatmapCell {
  day_of_week: number;
  hour_bucket: number;
  event_count: number;
  unique_sessions: number;
  views: number;
  comments: number;
  cta_clicks: number;
}

interface TopPage {
  page_path: string;
  target_type: string | null;
  views: number;
  unique_sessions: number;
  comments: number;
}

interface DailyRow {
  date_bucket: string;
  views: number;
  comments: number;
  unique_visitors: number;
  registered_visitors: number;
}

interface StatsData {
  heatmap: HeatmapCell[];
  top_pages: TopPage[];
  daily: DailyRow[];
  totals: {
    views_30d: number;
    comments_total: number;
    users_total: number;
  };
}

const DAYS_TH = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export default function AdminEngagementPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const pwd = sessionStorage.getItem('admin_pwd') || '';
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (!res.ok) {
        window.location.href = '/admin';
        return;
      }
      setAuthChecked(true);
      fetchStats();
      fetchComments();
    })();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const res = await fetch('/api/engagement/stats');
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    const res = await fetch('/api/admin/comments');
    if (res.ok) {
      const d = await res.json();
      setComments(d.comments || []);
    }
    setCommentsLoading(false);
  };

  const deleteComment = async (id: string) => {
    if (!confirm('ลบ comment นี้?')) return;
    setDeletingId(id);
    const pwd = sessionStorage.getItem('admin_pwd') || '';
    await fetch(`/api/admin/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    });
    setDeletingId(null);
    fetchComments();
    fetchStats();
  };

  // Build heatmap grid: 7 rows (day) × 24 cols (hour)
  const heatmapGrid: HeatmapCell[][] = Array.from({ length: 7 }, (_, dow) =>
    Array.from({ length: 24 }, (_, hour) => {
      const cell = (data?.heatmap || []).find((c) => c.day_of_week === dow && c.hour_bucket === hour);
      return cell || { day_of_week: dow, hour_bucket: hour, event_count: 0, unique_sessions: 0, views: 0, comments: 0, cta_clicks: 0 };
    })
  );

  const maxCount = Math.max(1, ...heatmapGrid.flat().map((c) => c.event_count));

  const getHeatColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity === 0) return 'bg-slate-100';
    if (intensity < 0.2) return 'bg-emerald-100';
    if (intensity < 0.4) return 'bg-emerald-300';
    if (intensity < 0.6) return 'bg-emerald-500';
    if (intensity < 0.8) return 'bg-emerald-600';
    return 'bg-emerald-800';
  };

  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin Dashboard</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-1 mb-2">📊 Engagement Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">สถิติการใช้งานแบบไม่ระบุตัวตน · ย้อนหลัง 30 วัน</p>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Summary color="from-blue-500 to-cyan-500" label="Page Views (30 วัน)" value={data.totals.views_30d.toLocaleString()} icon="👁️" />
            <Summary color="from-emerald-500 to-teal-500" label="ผู้ลงทะเบียน" value={data.totals.users_total} icon="👥" />
            <Summary color="from-violet-500 to-fuchsia-500" label="Comments ทั้งหมด" value={data.totals.comments_total} icon="💬" />
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">🔥 Engagement Heatmap</h2>
                <p className="text-xs text-gray-500">วันในสัปดาห์ × ชั่วโมง · ความเข้มของสี = กิจกรรม</p>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500">น้อย</span>
                <div className="flex gap-0.5">
                  <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
                  <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div>
                  <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
                  <div className="w-3 h-3 bg-emerald-800 rounded-sm"></div>
                </div>
                <span className="text-gray-500">มาก</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Hour labels */}
                <div className="flex gap-0.5 mb-1 ml-10">
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="w-5 text-center text-[9px] text-gray-400">
                      {h % 3 === 0 ? h : ''}
                    </div>
                  ))}
                </div>
                {/* Grid */}
                {heatmapGrid.map((row, dow) => (
                  <div key={dow} className="flex items-center gap-0.5 mb-0.5">
                    <div className="w-10 text-xs text-gray-500 text-right pr-2">{DAYS_TH[dow]}</div>
                    {row.map((cell, hour) => (
                      <div key={hour}
                        title={`${DAYS_TH[dow]} ${hour}:00 — ${cell.event_count} events (${cell.views} views, ${cell.comments} comments)`}
                        className={`w-5 h-5 rounded-sm cursor-help ${getHeatColor(cell.event_count)} hover:ring-2 hover:ring-emerald-400 transition`}>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily chart */}
          {data.daily.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-5 mb-6">
              <h2 className="font-semibold text-gray-800 mb-3">📈 Activity ย้อนหลัง 30 วัน</h2>
              <div className="flex items-end gap-1 h-32">
                {data.daily.slice().reverse().map((d) => {
                  const maxDaily = Math.max(1, ...data.daily.map((x) => x.views));
                  const heightPct = (d.views / maxDaily) * 100;
                  return (
                    <div key={d.date_bucket}
                      title={`${d.date_bucket}: ${d.views} views, ${d.comments} comments, ${d.unique_visitors} visitors`}
                      className="flex-1 flex flex-col items-center justify-end gap-0.5">
                      <div className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t cursor-help hover:from-emerald-600"
                        style={{ height: `${Math.max(2, heightPct)}%` }}>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>{data.daily[data.daily.length - 1]?.date_bucket}</span>
                <span>{data.daily[0]?.date_bucket}</span>
              </div>
            </div>
          )}

          {/* Top Pages */}
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <h2 className="font-semibold text-gray-800 mb-3">🔝 Top Pages (30 วัน)</h2>
            {data.top_pages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="space-y-1">
                {data.top_pages.slice(0, 15).map((p, i) => (
                  <div key={p.page_path} className="flex items-center gap-3 py-1.5 border-b last:border-0 text-sm">
                    <span className="text-xs font-bold text-gray-400 w-6">#{i + 1}</span>
                    <Link href={p.page_path} target="_blank" className="flex-1 truncate text-gray-800 hover:text-emerald-600">
                      {p.page_path}
                    </Link>
                    {p.target_type && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p.target_type}</span>
                    )}
                    <span className="text-xs text-gray-500 w-16 text-right">{p.views.toLocaleString()} views</span>
                    {p.comments > 0 && (
                      <span className="text-xs text-emerald-600 w-12 text-right">💬 {p.comments}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Comments (Admin moderation) */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="font-semibold text-gray-800 mb-3">💬 Comments ล่าสุด (Admin Moderation)</h2>
            {commentsLoading ? (
              <div className="text-center py-4 text-gray-400 text-sm">กำลังโหลด...</div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">ยังไม่มี comment</p>
            ) : (
              <div className="space-y-2">
                {comments.slice(0, 20).map((c: any) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{c.guest_user?.display_name || '-'}</span>
                        <span className="text-[10px] text-gray-500">{c.guest_user?.email}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.created_at).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Link href={`/${c.target_type}/${c.target_id}`} target="_blank"
                          className="text-[10px] text-blue-600 hover:underline">
                          {c.target_type} →
                        </Link>
                      </div>
                      <p className="text-sm text-gray-700 break-words">{c.content}</p>
                    </div>
                    <button onClick={() => deleteComment(c.id)} disabled={deletingId === c.id}
                      className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 whitespace-nowrap">
                      {deletingId === c.id ? '...' : 'ลบ'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ color, label, value, icon }: { color: string; label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color}`}></div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <span className="text-3xl opacity-20">{icon}</span>
      </div>
    </div>
  );
}
