'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if no choice has been made
    if (typeof window === 'undefined') return;
    const choice = localStorage.getItem('cookie_consent');
    if (!choice) {
      // Small delay so it doesn't flash on first load
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.removeItem('analytics_opt_out');
    setVisible(false);
  };

  const rejectOptional = () => {
    localStorage.setItem('cookie_consent', 'essential_only');
    localStorage.setItem('analytics_opt_out', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-50 bg-white border-2 border-emerald-200 rounded-2xl shadow-2xl p-4 md:p-5 animate-in slide-in-from-bottom-10">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">🍪</div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm">คุกกี้และความเป็นส่วนตัว</h3>
          <p className="text-xs text-gray-600 mt-1">
            เว็บไซต์นี้ใช้ cookies ที่จำเป็นเพื่อให้บริการ
            และสถิติการใช้งานแบบ<strong>ไม่ระบุตัวตน</strong> เพื่อปรับปรุงเว็บ
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={accept}
          className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-medium rounded-lg hover:opacity-90">
          ยอมรับทั้งหมด
        </button>
        <button onClick={rejectOptional}
          className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50">
          เฉพาะที่จำเป็น
        </button>
      </div>

      <p className="text-[10px] text-gray-400 mt-2 text-center">
        รายละเอียด: <Link href="/privacy-policy" className="text-blue-600 underline">นโยบายความเป็นส่วนตัว</Link>
      </p>
    </div>
  );
}
