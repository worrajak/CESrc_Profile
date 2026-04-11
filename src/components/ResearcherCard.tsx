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
