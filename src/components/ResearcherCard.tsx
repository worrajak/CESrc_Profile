'use client';

import { useRouter } from 'next/navigation';
import { Researcher } from '@/lib/supabase';
import { useI18n } from '@/lib/I18nContext';

const roleBadgeColor: Record<string, string> = {
  advisor: 'bg-purple-100 text-purple-800',
  head: 'bg-yellow-100 text-yellow-800',
  member: 'bg-blue-100 text-blue-800',
  phd_student: 'bg-pink-100 text-pink-800',
};

export default function ResearcherCard({ researcher }: { researcher: Researcher }) {
  const r = researcher;
  const { t, locale } = useI18n();
  const router = useRouter();
  const badgeColor = roleBadgeColor[r.unit_role] || roleBadgeColor.member;
  const badgeLabel = t(`researcher.role.${r.unit_role}`);

  const fullNameTh = `${r.title_th}${r.first_name_th} ${r.last_name_th}`;
  const fullNameEn = r.first_name_en
    ? `${r.title_en || ''} ${r.first_name_en} ${r.last_name_en || ''}`
    : '';

  // Choose primary/secondary names based on locale
  const primaryName = locale === 'en' && fullNameEn ? fullNameEn.trim() : fullNameTh;
  const secondaryName = locale === 'en' && fullNameEn ? fullNameTh : (fullNameEn ? fullNameEn.trim() : '');

  const navigate = () => router.push(`/researchers/${r.id}`);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate();
        }
      }}
      className="block cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-xl"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300 h-full">
        <div className="flex items-start justify-between mb-3">
          {/* Avatar: own avatar → fallback to executive portrait → fallback to initials */}
          {r.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.avatar_url} alt={primaryName} className="w-14 h-14 rounded-full object-cover" />
          ) : (r as any).executive_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(r as any).executive_photo_url}
              alt={primaryName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-200"
              title="ภาพจาก mhesi.rmutl.ac.th"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {r.first_name_th.charAt(0)}
            </div>
          )}
          <div className="flex flex-col gap-1 items-end">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColor}`}>
              {badgeLabel}
            </span>
            {r.is_pursuing_phd && r.unit_role !== 'phd_student' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-pink-100 text-pink-700">
                {t('researcher.role.researcher_phd')}
              </span>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-lg">{primaryName}</h3>
        {secondaryName && (
          <p className="text-sm text-gray-500 mt-0.5">{secondaryName}</p>
        )}

        {(locale === 'en' && r.position_en ? r.position_en : r.position_th) && (
          <p className="text-sm text-blue-600 mt-2">
            {locale === 'en' && r.position_en ? r.position_en : r.position_th}
          </p>
        )}

        {/* Executive role chip (RMUTL admin role, if any) */}
        {(r as any).executive_role_th && (
          <p className="mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              🏛️ {(r as any).executive_role_th}
            </span>
          </p>
        )}

        {/* Identifiers Row: ORCID + OpenAlex */}
        {(r.orcid_id || r.openalex_id) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            {r.orcid_id && (
              <a href={`https://orcid.org/${r.orcid_id}`} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded transition"
                title={`ORCID: ${r.orcid_id}`}>
                <svg viewBox="0 0 256 256" className="w-3 h-3" fill="#A6CE39">
                  <path d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z" />
                  <path d="M86.3,186.2H70.9V79.1h15.4v107.1z M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1C84.2,46.7,88.7,51.3,88.7,56.8z" fill="#FFF" />
                </svg>
                <span>ORCID</span>
              </a>
            )}
            {r.openalex_id && (
              <a href={`https://openalex.org/${r.openalex_id}`} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition"
                title={`OpenAlex: ${r.openalex_id}`}>
                <span className="font-bold">OA</span>
              </a>
            )}
          </div>
        )}

        {/* Citations Row */}
        {(r.cited_by_count > 0 || r.h_index > 0) && (
          <div className="flex items-center gap-3 mt-2">
            {r.cited_by_count > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-semibold text-orange-600">{r.cited_by_count.toLocaleString()}</span>
                <span className="text-xs text-gray-400">{t('researcher.cited')}</span>
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
    </div>
  );
}
