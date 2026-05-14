'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-client';
import { useAuth } from '@/lib/AuthContext';

type NavItem = {
  label: string;
  href: string;
  icon?: string;
  hint?: string;
};

type NavGroup = {
  label: string;
  icon: string;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  {
    label: 'เนื้อหา',
    icon: '📝',
    items: [
      { label: 'ข่าวสาร', href: '/admin/news', icon: '📰', hint: 'News & travel updates' },
      { label: 'ผลงานตีพิมพ์', href: '/admin/publications', icon: '📄', hint: 'Pubs / DOI import' },
      { label: 'นวัตกรรม / IP', href: '/admin/innovations', icon: '💡', hint: 'Patents · License fees' },
      { label: 'หัวข้อโครงงาน', href: '/admin/projects', icon: '🧪', hint: 'Project topics & tokens' },
    ],
  },
  {
    label: 'บุคลากร',
    icon: '👥',
    items: [
      { label: 'นักวิจัย', href: '/admin/researchers', icon: '👨‍🔬', hint: 'Profiles, ORCID, roles' },
      { label: 'นักศึกษา', href: '/admin/students', icon: '🎓', hint: 'BSc/MSc/PhD students' },
    ],
  },
  {
    label: 'ทุนวิจัย',
    icon: '💰',
    items: [
      { label: 'จัดการทุน', href: '/admin/grants', icon: '💼', hint: 'Grants, contracts, files' },
      { label: 'ติดตามโครงการ', href: '/admin/grants/tracking', icon: '📊', hint: 'S-curve, milestones, AI' },
      { label: 'แผนวิจัย (AI)', href: '/research-plan', icon: '🎯', hint: 'Grant calendar, proposals' },
    ],
  },
  {
    label: 'ครุภัณฑ์',
    icon: '🔧',
    items: [
      { label: 'ทะเบียนครุภัณฑ์', href: '/admin/equipment', icon: '🛠️', hint: 'Asset register' },
      { label: 'ระบบยืม-คืน', href: '/admin/equipment/borrowing', icon: '🔄', hint: 'Borrow/return tracking' },
    ],
  },
  {
    label: 'บริการ',
    icon: '🤝',
    items: [
      { label: 'คำขอบริการ', href: '/admin/services', icon: '📋', hint: 'Approve & assign' },
      { label: 'หลักสูตรอบรม', href: '/admin/training', icon: '🎓', hint: 'Training courses' },
    ],
  },
  {
    label: 'เชื่อมต่อ',
    icon: '🔗',
    items: [
      { label: 'ORCID', href: '/admin/orcid', icon: '🆔', hint: 'Pull pubs from ORCID' },
      { label: 'OpenAlex', href: '/admin/openalex', icon: '📚', hint: 'Citations, h-index sync' },
      { label: 'ตั้งค่า AI', href: '/admin/ai-settings', icon: '🤖', hint: 'API keys, models, test' },
    ],
  },
  {
    label: 'วิเคราะห์',
    icon: '📈',
    items: [
      { label: 'ประเมินภาระงาน', href: '/admin/workload', icon: '⚖️', hint: 'Annual workload summary' },
      { label: 'Engagement', href: '/admin/engagement', icon: '🔥', hint: 'Heatmap, visits, comments' },
    ],
  },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, email } = useAdminAuth();
  const { signOut } = useAuth();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_pwd');
    // If user is admin via Supabase, also sign them out of Supabase
    if (role === 'superadmin' || role === 'admin') {
      try { await signOut(); } catch {}
    }
    router.push('/admin');
    setTimeout(() => window.location.reload(), 50);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-base">⚙️</span>
            <div className="leading-tight">
              <span className="font-bold text-sm tracking-wide">CESRU Admin</span>
              <span className="hidden md:block text-[10px] text-slate-400">Operations console</span>
            </div>
          </Link>

          {/* Role badge */}
          {role && (
            <div className="hidden md:flex items-center gap-2 ml-3 pl-3 border-l border-slate-700">
              {role === 'superadmin' && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
                  ⭐ Super
                </span>
              )}
              {role === 'admin' && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-blue-600 text-white rounded">
                  Admin
                </span>
              )}
              {role === 'legacy' && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-gray-600 text-white rounded" title="เข้าด้วยรหัสผ่าน (anonymous)">
                  Legacy
                </span>
              )}
              {email && (
                <span className="text-[10px] text-slate-300 max-w-[180px] truncate" title={email}>
                  {email}
                </span>
              )}
            </div>
          )}

          {/* Desktop nav — grouped dropdowns */}
          <div ref={wrapRef} className="hidden lg:flex items-center gap-1">
            <Link
              href="/admin"
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${
                pathname === '/admin'
                  ? 'bg-white/15 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              🏠 Dashboard
            </Link>

            {GROUPS.map((g) => {
              const groupActive = g.items.some((it) => isActive(it.href));
              const open = openGroup === g.label;
              return (
                <div key={g.label} className="relative">
                  <button
                    onClick={() => setOpenGroup(open ? null : g.label)}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition flex items-center gap-1 ${
                      groupActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm leading-none">{g.icon}</span>
                    <span>{g.label}</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {open && (
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white text-gray-800 rounded-lg shadow-xl border py-2 z-50">
                      {g.items.map((it) => {
                        const active = isActive(it.href);
                        return (
                          <Link
                            key={it.href}
                            href={it.href}
                            onClick={() => setOpenGroup(null)}
                            className={`block px-3 py-2 hover:bg-blue-50 transition ${active ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              {it.icon && <span className="text-sm">{it.icon}</span>}
                              <div className="min-w-0">
                                <p className={`text-xs font-medium ${active ? 'text-blue-700' : 'text-gray-800'}`}>
                                  {it.label}
                                </p>
                                {it.hint && <p className="text-[10px] text-gray-500 truncate">{it.hint}</p>}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/"
              className="text-xs px-3 py-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/10 transition"
              title="Back to public site"
            >
              ← เว็บไซต์
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 bg-rose-600 hover:bg-rose-700 rounded-md font-medium transition"
              title="Logout"
            >
              🚪 ออก
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-slate-800 border-t border-slate-700 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded text-sm ${
                pathname === '/admin' ? 'bg-white/15' : 'hover:bg-white/10'
              }`}
            >
              🏠 Dashboard
            </Link>
            {GROUPS.map((g) => (
              <div key={g.label}>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 px-3">
                  {g.icon} {g.label}
                </p>
                <div className="space-y-0.5">
                  {g.items.map((it) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-2 rounded text-sm ${
                        isActive(it.href) ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      {it.icon && <span className="mr-1">{it.icon}</span>}
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-700 flex gap-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-3 py-2 bg-slate-700 rounded text-xs"
              >
                ← เว็บไซต์
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 rounded text-xs font-medium"
              >
                🚪 ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
