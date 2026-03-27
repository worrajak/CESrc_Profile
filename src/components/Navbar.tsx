'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-yellow-300 transition">หน้าแรก</Link>
            <Link href="/researchers" className="hover:text-yellow-300 transition">นักวิจัย</Link>
            <Link href="/publications" className="hover:text-yellow-300 transition">ผลงานตีพิมพ์</Link>
            <Link href="/grants" className="hover:text-yellow-300 transition">ทุนวิจัย</Link>
            <Link href="/patents" className="hover:text-yellow-300 transition">สิทธิบัตร</Link>
            <Link href="/services" className="hover:text-yellow-300 transition">บริการวิชาการ</Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2">
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
        <div className="md:hidden px-4 pb-4 space-y-2">
          <Link href="/" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>หน้าแรก</Link>
          <Link href="/researchers" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>นักวิจัย</Link>
          <Link href="/publications" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>ผลงานตีพิมพ์</Link>
          <Link href="/grants" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>ทุนวิจัย</Link>
          <Link href="/patents" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>สิทธิบัตร</Link>
          <Link href="/services" className="block py-2 hover:text-yellow-300" onClick={() => setOpen(false)}>บริการวิชาการ</Link>
        </div>
      )}
    </nav>
  );
}
