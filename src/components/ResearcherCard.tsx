import Link from 'next/link';
import { Researcher } from '@/lib/supabase';

const roleBadge: Record<string, { label: string; color: string }> = {
  advisor: { label: 'ที่ปรึกษา', color: 'bg-purple-100 text-purple-800' },
  head: { label: 'หัวหน้าหน่วยฯ', color: 'bg-yellow-100 text-yellow-800' },
  member: { label: 'สมาชิก', color: 'bg-blue-100 text-blue-800' },
};

export default function ResearcherCard({ researcher }: { researcher: Researcher }) {
  const r = researcher;
  const badge = roleBadge[r.unit_role] || roleBadge.member;
  const fullNameTh = `${r.title_th}${r.first_name_th} ${r.last_name_th}`;
  const fullNameEn = r.first_name_en
    ? `${r.title_en || ''} ${r.first_name_en} ${r.last_name_en || ''}`
    : '';

  return (
    <Link href={`/researchers/${r.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300 h-full">
        <div className="flex items-start justify-between mb-3">
          {r.avatar_url ? (
            <img src={r.avatar_url} alt={fullNameTh} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {r.first_name_th.charAt(0)}
            </div>
          )}
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg">{fullNameTh}</h3>
        {fullNameEn && (
          <p className="text-sm text-gray-500 mt-0.5">{fullNameEn.trim()}</p>
        )}

        {r.position_th && (
          <p className="text-sm text-blue-600 mt-2">{r.position_th}</p>
        )}

        {(r.cited_by_count > 0 || r.h_index > 0) && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            {r.cited_by_count > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-orange-600">{r.cited_by_count.toLocaleString()}</span>
                <span className="text-xs text-gray-400">cited</span>
              </div>
            )}
            {r.h_index > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-purple-600">H</span>
                <span className="text-xs font-semibold text-purple-600">{r.h_index}</span>
              </div>
            )}
            {r.i10_index > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-green-600">i10</span>
                <span className="text-xs font-semibold text-green-600">{r.i10_index}</span>
              </div>
            )}
          </div>
        )}

        {r.expertise && r.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {r.expertise.slice(0, 3).map((exp, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {exp}
              </span>
            ))}
            {r.expertise.length > 3 && (
              <span className="text-xs text-gray-400">+{r.expertise.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
