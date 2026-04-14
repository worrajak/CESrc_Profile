'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!authenticated) {
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
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Link
          href="/admin/news"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-blue-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">จัดการข่าวสาร</h3>
          <p className="text-sm text-gray-500">เขียนข่าว, เพิ่มรูป, ลบข่าว</p>
        </Link>
        <Link
          href="/admin/publications"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-green-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">นำเข้าผลงานตีพิมพ์</h3>
          <p className="text-sm text-gray-500">Import จาก DOI, จับคู่นักวิจัย</p>
        </Link>
        <Link
          href="/admin/students"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-indigo-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">จัดการนักศึกษา</h3>
          <p className="text-sm text-gray-500">เพิ่ม/แก้ไข นศ. ป.ตรี-เอก</p>
        </Link>
        <Link
          href="/admin/projects"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-orange-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">หัวข้อโครงงาน</h3>
          <p className="text-sm text-gray-500">ประกาศหัวข้อ, ออก Token</p>
        </Link>
        <Link
          href="/admin/grants"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-emerald-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">จัดการทุนวิจัย</h3>
          <p className="text-sm text-gray-500">เพิ่ม/แก้ไข ทุน, แนบสัญญา</p>
        </Link>
        <Link
          href="/admin/grants/tracking"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-lime-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">ติดตามทุนวิจัย</h3>
          <p className="text-sm text-gray-500">Milestones, S-Curve, AI วิเคราะห์</p>
        </Link>
        <Link
          href="/admin/equipment"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-cyan-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">จัดการครุภัณฑ์</h3>
          <p className="text-sm text-gray-500">ทะเบียน เพิ่ม/ลด/ตัดจำหน่าย</p>
        </Link>
        <Link
          href="/admin/equipment/borrowing"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-teal-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">ระบบยืม-คืน</h3>
          <p className="text-sm text-gray-500">อนุมัติ/คืน/ติดตามเกินกำหนด</p>
        </Link>
        <Link
          href="/admin/training"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-violet-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">จัดการหลักสูตรอบรม</h3>
          <p className="text-sm text-gray-500">นำเข้าเอกสาร AI แยกกำหนดการ/เกณฑ์</p>
        </Link>
        <Link
          href="/admin/services"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-purple-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">จัดการคำขอบริการ</h3>
          <p className="text-sm text-gray-500">อนุมัติ/มอบหมาย/ติดตามคำขอ</p>
        </Link>
        <Link
          href="/admin/orcid"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-green-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">ORCID Integration</h3>
          <p className="text-sm text-gray-500">ดึงผลงาน/ทุนจาก ORCID ลง DB</p>
        </Link>
        <Link
          href="/admin/openalex"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-orange-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">OpenAlex Sync</h3>
          <p className="text-sm text-gray-500">Citations, H-index, 250M+ ผลงาน (ฟรี)</p>
        </Link>
        <Link
          href="/admin/ai-settings"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-pink-500 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">ตั้งค่า AI</h3>
          <p className="text-sm text-gray-500">API Key, เลือกโมเดล, ทดสอบ</p>
        </Link>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-gray-400 block"
        >
          <h3 className="font-semibold text-gray-800 mb-1">Supabase Dashboard</h3>
          <p className="text-sm text-gray-500">จัดการฐานข้อมูลและ Storage</p>
        </a>
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
