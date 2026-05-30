'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/admin-auth-client';
import SignInModal from '@/components/SignInModal';
import HomepageCacheControl from '@/components/admin/HomepageCacheControl';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Quick action cards grouped by category. Order + grouping match the
 * AdminNavbar dropdowns so visitors can flip between top-bar dropdowns
 * and dashboard cards without re-learning the layout.
 */
type AdminItem = { title: string; desc: string; href: string; border: string; external?: boolean };
type AdminGroup = { title: string; icon: string; items: AdminItem[] };

const ADMIN_GROUPS: AdminGroup[] = [
  {
    title: 'เนื้อหา',
    icon: '📝',
    items: [
      { title: 'จัดการข่าวสาร', desc: 'เขียนข่าว, เพิ่มรูป, ลบข่าว', href: '/admin/news', border: 'border-blue-500' },
      { title: 'นำเข้าผลงานตีพิมพ์', desc: 'Import จาก DOI, จับคู่นักวิจัย', href: '/admin/publications', border: 'border-green-500' },
      { title: '💡 จัดการนวัตกรรม / IP', desc: 'สิทธิบัตร · อนุสิทธิบัตร · ค่าสิทธิ TLO', href: '/admin/innovations', border: 'border-amber-500' },
    ],
  },
  {
    title: 'บุคลากร',
    icon: '👥',
    items: [
      { title: 'จัดการนักวิจัย', desc: 'เพิ่ม/แก้ไขโปรไฟล์ บทบาท ORCID', href: '/admin/researchers', border: 'border-blue-700' },
      { title: 'จัดการนักศึกษา', desc: 'เพิ่ม/แก้ไข นศ. ป.ตรี-เอก', href: '/admin/students', border: 'border-indigo-500' },
      { title: 'หัวข้อโครงงาน', desc: 'ประกาศหัวข้อ, ออก Token', href: '/admin/projects', border: 'border-orange-500' },
    ],
  },
  {
    title: 'ทุนวิจัย',
    icon: '💰',
    items: [
      { title: 'จัดการทุนวิจัย', desc: 'เพิ่ม/แก้ไข ทุน, แนบสัญญา', href: '/admin/grants', border: 'border-emerald-500' },
      { title: 'ติดตามทุนวิจัย', desc: 'Milestones, S-Curve, AI วิเคราะห์', href: '/admin/grants/tracking', border: 'border-lime-500' },
    ],
  },
  {
    title: 'ครุภัณฑ์',
    icon: '🔧',
    items: [
      { title: 'จัดการครุภัณฑ์', desc: 'ทะเบียน เพิ่ม/ลด/ตัดจำหน่าย', href: '/admin/equipment', border: 'border-cyan-500' },
      { title: 'ระบบยืม-คืน', desc: 'อนุมัติ/คืน/ติดตามเกินกำหนด', href: '/admin/equipment/borrowing', border: 'border-teal-500' },
    ],
  },
  {
    title: 'บริการ',
    icon: '🎓',
    items: [
      { title: 'จัดการหลักสูตรอบรม', desc: 'นำเข้าเอกสาร AI แยกกำหนดการ/เกณฑ์', href: '/admin/training', border: 'border-violet-500' },
      { title: 'จัดการคำขอบริการ', desc: 'อนุมัติ/มอบหมาย/ติดตามคำขอ', href: '/admin/services', border: 'border-purple-500' },
    ],
  },
  {
    title: 'เชื่อมต่อ / ตั้งค่า',
    icon: '🔗',
    items: [
      { title: 'ORCID Integration', desc: 'ดึงผลงาน/ทุนจาก ORCID ลง DB', href: '/admin/orcid', border: 'border-green-500' },
      { title: 'OpenAlex Sync', desc: 'Citations, H-index, 250M+ ผลงาน (ฟรี)', href: '/admin/openalex', border: 'border-orange-500' },
      { title: 'ตั้งค่า AI', desc: 'API Key, เลือกโมเดล, ทดสอบ', href: '/admin/ai-settings', border: 'border-pink-500' },
      { title: 'Supabase Dashboard', desc: 'จัดการฐานข้อมูลและ Storage', href: 'https://supabase.com/dashboard', border: 'border-gray-400', external: true },
    ],
  },
  {
    title: 'วิเคราะห์',
    icon: '📊',
    items: [
      { title: 'ประเมินภาระงาน', desc: 'สรุปผลงาน/ทุน/เดินทาง/อบรม รายปี', href: '/admin/workload', border: 'border-emerald-500' },
      { title: 'Engagement Analytics', desc: 'Heatmap, comments, ผู้เยี่ยมชม (PDPA)', href: '/admin/engagement', border: 'border-rose-500' },
    ],
  },
];

export default function AdminPage() {
  const { role, loading: roleLoading } = useAdminAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signInOpen, setSignInOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // If Supabase user is admin (via email match), skip the password screen entirely.
  const supabaseAdmin = role === 'superadmin' || role === 'admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('admin_pwd', password);
      } else {
        setError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  // Show loading while we figure out the role
  if (roleLoading && !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authenticated && !supabaseAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Admin Analytics
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน Admin
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ (รหัสผ่าน)'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-3">
              หรือถ้าคุณเป็นนักวิจัยในหน่วย CESRU เข้าสู่ระบบด้วย email ที่ลงทะเบียนไว้ในระบบ
            </p>
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
            >
              ✉️ เข้าสู่ระบบด้วย email
            </button>
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              ใช้ Magic Link หรือรหัสผ่าน · ระบบจะตรวจ email กับฐานนักวิจัย<br />
              ถ้าตรง → ได้สิทธิ admin อัตโนมัติ (ไม่ต้องใส่รหัสผ่านนี้)
            </p>
          </div>
        </div>

        {signInOpen && <SignInModal onClose={() => setSignInOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem('admin_auth');
            setAuthenticated(false);
          }}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Homepage AI cache control */}
      <div className="mb-6">
        <HomepageCacheControl />
      </div>

      {/* Quick Actions — organised into 7 categories matching the AdminNavbar Operations console */}
      <div className="space-y-6 mb-8">
        {ADMIN_GROUPS.map((group) => (
          <section key={group.title}>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase flex items-center gap-2">
                <span>{group.icon}</span>
                <span>{group.title}</span>
                <span className="text-[10px] text-gray-400 normal-case font-normal">
                  ({group.items.length})
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.items.map((item) =>
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-sm transition p-3 block border-l-4 ${item.border}`}
                  >
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.desc}</p>
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`bg-white rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-sm transition p-3 block border-l-4 ${item.border}`}
                  >
                    <h3 className="font-semibold text-gray-800 text-sm leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.desc}</p>
                  </Link>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      {/* GA Embed Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Stats Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Google Analytics</h2>
          {GA_ID ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tracking ID:</span>{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{GA_ID}</code>
              </p>
              <p className="text-sm text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                กำลังเก็บข้อมูลผู้เยี่ยมชม
              </p>
              <div className="mt-4 pt-4 border-t">
                <a
                  href={`https://analytics.google.com/analytics/web/#/p${GA_ID.replace('G-', '')}/reports/intelligenthome`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  เปิด Google Analytics Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-red-500 text-sm">ไม่พบ GA Tracking ID - กรุณาตั้งค่า NEXT_PUBLIC_GA_ID</p>
          )}
        </div>

        {/* Site Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">ข้อมูลเว็บไซต์</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between py-2 border-b">
              <span>ชื่อเว็บ</span>
              <span className="font-medium text-gray-800">CESRU Researcher Profile</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Framework</span>
              <span className="font-medium text-gray-800">Next.js 14</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Database</span>
              <span className="font-medium text-gray-800">Supabase</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Analytics</span>
              <span className="font-medium text-gray-800">Google Analytics 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pages Overview */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">หน้าที่ถูกติดตาม</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { path: '/', name: 'หน้าหลัก', icon: '🏠' },
            { path: '/researchers', name: 'นักวิจัย', icon: '👨‍🔬' },
            { path: '/publications', name: 'ผลงานวิจัย', icon: '📄' },
            { path: '/grants', name: 'ทุนวิจัย', icon: '💰' },
            { path: '/services', name: 'บริการวิชาการ', icon: '🔧' },
            { path: '/services/training', name: 'หลักสูตรอบรม', icon: '🎓' },
            { path: '/services/consulting', name: 'ที่ปรึกษา & ออกแบบ', icon: '💡' },
            { path: '/research-areas', name: 'สาขาวิจัย', icon: '🔬' },
            { path: '/equipment', name: 'ครุภัณฑ์', icon: '🔬' },
          ].map((page) => (
            <div key={page.path} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-2xl">{page.icon}</span>
              <div>
                <p className="font-medium text-gray-800">{page.name}</p>
                <p className="text-xs text-gray-500">{page.path}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GA Realtime Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">วิธีดูข้อมูลแบบ Realtime</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">ดูข้อมูลผู้เข้าชมแบบ Realtime ได้ที่ Google Analytics:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>เข้าไปที่ <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">analytics.google.com</a></li>
            <li>เลือก Property ที่มี ID: <code className="bg-blue-100 px-1 rounded">{GA_ID}</code></li>
            <li>ไปที่เมนู <strong>Reports → Realtime</strong></li>
            <li>จะเห็นข้อมูลผู้เข้าชมแบบเรียลไทม์</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
