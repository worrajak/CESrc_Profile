import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { st, getServerLocale } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';

const TYPE_COLOR: Record<string, string> = {
  petty_patent: 'from-amber-500 to-orange-500',
  patent: 'from-violet-500 to-fuchsia-500',
  copyright: 'from-blue-500 to-cyan-500',
  trademark: 'from-pink-500 to-rose-500',
  trade_secret: 'from-gray-600 to-slate-600',
  prototype: 'from-emerald-500 to-teal-500',
};

export default async function InnovationDetailPage({ params }: { params: { id: string } }) {
  const locale = getServerLocale();
  const { data: it } = await supabase
    .from('cesru_innovations')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single();

  if (!it) notFound();

  // Researchers
  const allResearcherIds = Array.from(new Set([
    ...(it.inventor_ids || []),
    it.contact_researcher_id,
  ].filter(Boolean)));
  let researcherMap: Record<string, any> = {};
  if (allResearcherIds.length > 0) {
    const { data: rs } = await supabase
      .from('researchers')
      .select('id, title_th, first_name_th, last_name_th, title_en, first_name_en, last_name_en, email, phone, avatar_url, department, faculty')
      .in('id', allResearcherIds);
    (rs || []).forEach((r: any) => (researcherMap[r.id] = r));
  }

  const title = locale === 'en' && it.title_en ? it.title_en : it.title_th;
  const desc = locale === 'en' && it.short_desc_en ? it.short_desc_en : it.short_desc_th;
  const longDesc = it.long_desc_th;
  const contact = it.contact_researcher_id ? researcherMap[it.contact_researcher_id] : null;
  const inventors = (it.inventor_ids || []).map((id: string) => researcherMap[id]).filter(Boolean);

  // Images list (cover + extras)
  const images: string[] = [it.cover_image_url, ...(it.image_urls || [])].filter(Boolean);
  const documents: Array<{ label: string; url: string; type?: string; size_kb?: number }> = it.documents || [];

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
  const fmtTHB = (n: number | null) => n != null ? n.toLocaleString('th-TH', { minimumFractionDigits: 2 }) + ' บาท' : '—';

  const fee = it.license_fee_breakdown || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 pb-12">
      {/* Header */}
      <div className={`bg-gradient-to-r ${TYPE_COLOR[it.innovation_type] || 'from-amber-600 to-orange-600'} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/innovations" className="text-xs text-white/80 hover:text-white inline-flex items-center gap-1 mb-3">
            ← {st('innov.title', locale)}
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/15">
              {st(`innov.type.${it.innovation_type}` as any, locale)}
            </span>
            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/15">
              {st(`innov.status.${it.status}` as any, locale)}
            </span>
            {it.ip_number && (
              <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-white/15">
                {st('innov.field.ip_number', locale)}: {it.ip_number}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold leading-snug">{title}</h1>
          {desc && <p className="text-sm text-white/90 mt-2 max-w-3xl">{desc}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: gallery + long desc + license breakdown */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image gallery */}
          {images.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-3">
              {/* Main image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[0]} alt={title} className="w-full max-h-[420px] object-contain rounded-xl bg-gray-50" />
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {images.slice(1, 5).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="" className="w-full h-20 object-cover rounded-lg bg-gray-50 border" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Long description */}
          {longDesc && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 text-sm mb-2">📖 รายละเอียด</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{longDesc}</p>
            </div>
          )}

          {/* License fee breakdown */}
          {(it.license_fee_thb || fee.disclosure_fee) && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">💰 {st('innov.field.license_fee', locale)}</h2>
              <div className="space-y-2 text-xs">
                {fee.disclosure_fee != null && (
                  <Row label={locale === 'en' ? 'Disclosure fee' : 'ค่าตอบแทนการอนุญาตให้ใช้สิทธิ (Disclosure fee)'}>
                    {fmtTHB(fee.disclosure_fee)}
                  </Row>
                )}
                {fee.vat_pct && (
                  <Row label={`VAT (${fee.vat_pct}%)`}>
                    {fmtTHB(fee.vat_amount ?? (fee.disclosure_fee * fee.vat_pct / 100))}
                  </Row>
                )}
                <div className="border-t border-emerald-200 pt-2 mt-2 bg-emerald-50 -mx-5 px-5 py-2">
                  <Row label={<strong>{locale === 'en' ? 'Total' : 'รวมสุทธิ'}</strong>} bold>
                    <span className="text-emerald-700 font-bold">{fmtTHB(it.license_fee_thb)}</span>
                  </Row>
                </div>
                {fee.tech_transfer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-[11px] font-semibold text-blue-800 mb-1">🛠️ การถ่ายทอดเทคโนโลยี</p>
                    <p className="text-[11px] text-blue-700">
                      ไม่เกิน {fee.tech_transfer.sessions} ครั้ง × {fee.tech_transfer.people_per_session} คน × {fee.tech_transfer.hours_per_day} ชม × {fee.tech_transfer.days} วันทำการ
                    </p>
                  </div>
                )}
                {fee.consulting && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-[11px] font-semibold text-purple-800 mb-1">💬 การให้คำปรึกษา (1 ปี)</p>
                    <p className="text-[11px] text-purple-700">
                      ไม่เกิน {fee.consulting.sessions} × {fee.consulting.times_per_session} ครั้ง × {fee.consulting.hours_per_day} ชม × {fee.consulting.days} วันทำการ
                    </p>
                  </div>
                )}
                {fee.late_penalty_pct && (
                  <p className="text-[10px] text-gray-500 italic">⚠️ ค่าปรับผิดนัดชำระ {fee.late_penalty_pct}% ต่อปี</p>
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">📎 {st('innov.field.documents', locale)}</h2>
              <ul className="space-y-2">
                {documents.map((doc, i) => (
                  <li key={i}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition">
                      <span className="text-2xl">{doc.type === 'pdf' ? '📄' : doc.type === 'image' ? '🖼️' : '📎'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.label}</p>
                        {doc.size_kb && <p className="text-[10px] text-gray-500">{doc.size_kb} KB</p>}
                      </div>
                      <span className="text-blue-600 text-xs">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: contact + license + inventors */}
        <div className="space-y-4">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-3">📅 ข้อมูลทรัพย์สินทางปัญญา</h2>
            <div className="space-y-1.5 text-xs">
              <Row label={st('innov.field.filed', locale)}>{fmtDate(it.filing_date)}</Row>
              <Row label={st('innov.field.granted', locale)}>{fmtDate(it.grant_date)}</Row>
              {it.license_start_date && <Row label={st('innov.field.license_period', locale)}>{fmtDate(it.license_start_date)} → {fmtDate(it.license_end_date)}</Row>}
              {it.license_territory && <Row label={st('innov.field.territory', locale)}>{it.license_territory}</Row>}
              {it.license_holder_name && <Row label={st('innov.field.license_holder', locale)}>{it.license_holder_name}</Row>}
              {it.license_contract_no && <Row label={st('innov.field.contract_no', locale)}><span className="font-mono">{it.license_contract_no}</span></Row>}
              {it.license_type && <Row label={st('innov.field.license_type', locale)}>{it.license_type === 'exclusive' ? 'Exclusive' : it.license_type === 'sole' ? 'Sole' : 'Non-exclusive'}</Row>}
            </div>
          </div>

          {/* Contact card */}
          {contact && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 shadow-sm p-5">
              <h2 className="font-semibold text-blue-900 text-sm mb-3">📞 {st('innov.field.contact', locale)}</h2>
              <div className="flex items-center gap-3 mb-3">
                {contact.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={contact.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold">
                    {(contact.first_name_th || contact.first_name_en || '?').charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">
                    {locale === 'en' && contact.first_name_en
                      ? `${contact.title_en || ''} ${contact.first_name_en} ${contact.last_name_en || ''}`
                      : `${contact.title_th || ''}${contact.first_name_th || ''} ${contact.last_name_th || ''}`}
                  </p>
                  {contact.department && <p className="text-[11px] text-gray-600">{contact.department}</p>}
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-blue-700 hover:underline">
                    ✉️ <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-blue-700 hover:underline">
                    📱 <span>{contact.phone}</span>
                  </a>
                )}
                <p className="text-gray-600 mt-2 text-[11px] leading-relaxed">
                  📍 หน่วยวิจัยระบบพลังงานสะอาด (CESRU)<br />
                  คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา<br />
                  128 ถ.ห้วยแก้ว ต.ช้างเผือก อ.เมือง จ.เชียงใหม่ 50300
                </p>
              </div>
            </div>
          )}

          {/* Inventors */}
          {inventors.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">👥 {st('innov.field.inventors', locale)}</h2>
              <ul className="space-y-2">
                {inventors.map((r: any) => (
                  <li key={r.id} className="flex items-center gap-2 text-xs">
                    {r.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white text-[10px] flex items-center justify-center">
                        {(r.first_name_th || r.first_name_en || '?').charAt(0)}
                      </div>
                    )}
                    <span className="text-gray-700">
                      {locale === 'en' && r.first_name_en
                        ? `${r.first_name_en} ${r.last_name_en || ''}`
                        : `${r.title_th || ''}${r.first_name_th || ''} ${r.last_name_th || ''}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, bold = false }: { label: React.ReactNode; children: React.ReactNode; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${bold ? '' : 'py-0.5'}`}>
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-800 text-right min-w-0">{children}</span>
    </div>
  );
}
