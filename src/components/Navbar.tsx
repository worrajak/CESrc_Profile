'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const serviceRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) {
        setServiceOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo-cesru.jpeg" alt="CESRU Logo" width={44} height={44} className="rounded-full bg-white" />
            <div>
              <span className="font-bold text-lg block leading-tight">CESRU</span>
              <span className="text-xs text-blue-200">Clean Energy System Research Unit</span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center space-x-5 text-sm">
            <Link href="/" className="hover:text-yellow-300 transition">หน้าแรก</Link>
            <Link href="/news" className="hover:text-yellow-300 transition">ข่าวสาร</Link>
            <Link href="/researchers" className="hover:text-yellow-300 transition">นักวิจัย</Link>
            <Link href="/research-areas" className="hover:text-yellow-300 transition">สาขาวิจัย</Link>
            <Link href="/publications" className="hover:text-yellow-300 transition">ผลงานตีพิมพ์</Link>
            <Link href="/grants" className="hover:text-yellow-300 transition">ทุนวิจัย</Link>
            <Link href="/students" className="hover:text-yellow-300 transition">นักศึกษา</Link>

            {/* Services Dropdown */}
            <div ref={serviceRef} className="relative">
              <button
                onClick={() => setServiceOpen(!serviceOpen)}
                className="hover:text-yellow-300 transition flex items-center gap-1"
              >
                บริการวิชาการ
                <svg className={`w-3 h-3 transition-transform ${serviceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {serviceOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50">
                  <Link href="/services" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                    <div className="font-medium text-sm">ผลงานบริการวิชาการ</div>
                    <div className="text-[10px] text-gray-400">Site References</div>
                  </Link>
                  <div className="border-t my-1" />
                  <Link href="/services/training" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition">
                    <div className="flex items-center gap-2">
                      <span>🎓</span>
                      <div>
                        <div className="font-medium text-sm">หลักสูตรอบรม</div>
                        <div className="text-[10px] text-gray-400">Training & NFT Certificate</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/services/consulting" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition">
                    <div className="flex items-center gap-2">
                      <span>💡</span>
                      <div>
                        <div className="font-medium text-sm">ที่ปรึกษา & ออกแบบ</div>
                        <div className="text-[10px] text-gray-400">Consulting & Design</div>
                      </div>
                    </div>
                  </Link>
                  <div className="border-t my-1" />
                  <Link href="/services/request" onClick={() => setServiceOpen(false)}
                    className="block px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-700 transition">
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <div>
                        <div className="font-medium text-sm">ส่งคำขอบริการ</div>
                        <div className="text-[10px] text-gray-400">Service Request</div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/equipment" className="hover:text-yellow-300 transition">ครุภัณฑ์</Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden px-4 pb-4 space-y-1">
          <Link href="/" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>หน้าแรก</Link>
          <Link href="/news" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>ข่าวสาร</Link>
          <Link href="/researchers" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>นักวิจัย</Link>
          <Link href="/research-areas" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>สาขาวิจัย</Link>
          <Link href="/publications" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>ผลงานตีพิมพ์</Link>
          <Link href="/grants" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>ทุนวิจัย</Link>
          <Link href="/students" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>นักศึกษา</Link>

          {/* Services sub-menu (mobile) */}
          <div className="border-t border-blue-600 pt-2 mt-2">
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">บริการวิชาการ</p>
            <Link href="/services" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              📋 ผลงานบริการวิชาการ
            </Link>
            <Link href="/services/training" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              🎓 หลักสูตรอบรม
            </Link>
            <Link href="/services/consulting" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              💡 ที่ปรึกษา & ออกแบบ
            </Link>
            <Link href="/services/request" className="block py-2 pl-4 hover:text-yellow-300 text-sm" onClick={() => setOpen(false)}>
              📝 ส่งคำขอบริการ
            </Link>
          </div>

          <div className="border-t border-blue-600 pt-2">
            <Link href="/equipment" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>ครุภัณฑ์</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
