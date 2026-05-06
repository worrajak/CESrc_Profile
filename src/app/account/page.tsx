'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, profile, loading, updateProfile, deleteAccount, signOut } = useAuth();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState<'student' | 'researcher' | 'general'>('general');
  const [institution, setInstitution] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEdit = () => {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setUserType(profile.user_type);
    setInstitution(profile.institution || '');
    setMarketingOptIn(profile.marketing_opt_in);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      display_name: displayName.trim(),
      user_type: userType,
      institution: institution.trim() || null,
      marketing_opt_in: marketingOptIn,
    });
    setEditing(false);
    setSaving(false);
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const { data } = await supabase.rpc('export_user_data', { p_user_id: user.id });
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteAccount();
    router.push('/');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!user || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className="text-xl font-semibold text-gray-700 mb-3">{locale === 'en' ? 'Please sign in' : 'กรุณาเข้าสู่ระบบ'}</h1>
        <Link href="/" className="text-blue-600 underline">{locale === 'en' ? 'Back to home' : 'กลับหน้าหลัก'}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← {t('nav.home')}</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-3 mb-6">{t('account.title')}</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{t('account.profile')}</h2>
          {!editing && (
            <button onClick={startEdit} className="text-sm text-blue-600 hover:underline">
              ✏️ {t('common.edit')}
            </button>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3 text-sm">
            <Row label={t('account.email')}>{profile.email}</Row>
            <Row label={t('account.display_name')}>{profile.display_name}</Row>
            <Row label={t('account.user_type')}>
              {t(`nav.user_type.${profile.user_type}`)}
            </Row>
            <Row label={t('account.institution')}>{profile.institution || '-'}</Row>
            <Row label={t('account.comments_count')}>{profile.comment_count}</Row>
            <Row label={t('account.joined')}>
              {new Date(profile.consented_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}{locale === 'en' ? 'Privacy Policy v' : 'ตาม Privacy Policy v'}{profile.consent_version}
            </Row>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('account.display_name')}</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('account.user_type')}</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="student">{t('nav.user_type.student')}</option>
                <option value="researcher">{t('nav.user_type.researcher')}</option>
                <option value="general">{t('nav.user_type.general')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('account.institution')}</label>
              <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm pt-2">
              <input type="checkbox" checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)} />
              <span>{locale === 'en' ? 'Receive CESRU news via email' : 'รับข่าวสารจาก CESRU ทาง email'}</span>
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
                {saving ? `${t('common.save')}...` : t('common.save')}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-1.5 border text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PDPA Rights */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('account.pdpa_rights')}</h2>
        <p className="text-xs text-gray-500 mb-4">
          {locale === 'en'
            ? 'Thailand PDPA (Personal Data Protection Act, B.E. 2562) grants you rights over your personal data'
            : 'พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ให้สิทธิท่านในข้อมูลส่วนบุคคล'}
        </p>

        <div className="space-y-3">
          <button onClick={handleExport} disabled={exporting}
            className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
            <div className="text-left">
              <p className="text-sm font-medium text-blue-800">📋 {t('account.export')}</p>
              <p className="text-xs text-blue-600">{t('account.export_subtitle')}</p>
            </div>
            <span className="text-blue-600">{exporting ? '...' : '→'}</span>
          </button>

          <button onClick={signOut}
            className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">🚪 {t('account.signout_title')}</p>
              <p className="text-xs text-gray-500">{t('account.signout_subtitle')}</p>
            </div>
            <span className="text-gray-500">→</span>
          </button>

          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition">
              <div className="text-left">
                <p className="text-sm font-medium text-red-800">🗑️ {t('account.delete')}</p>
                <p className="text-xs text-red-600">{t('account.delete_subtitle')}</p>
              </div>
              <span className="text-red-600">→</span>
            </button>
          ) : (
            <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg space-y-2">
              <p className="text-sm font-medium text-red-800">⚠️ {t('account.delete_confirm')}</p>
              <p className="text-xs text-red-700">
                {locale === 'en'
                  ? `Deletion will remove: profile, all your comments (${profile.comment_count}).`
                  : `การลบนี้จะลบ: ข้อมูลโปรไฟล์, comment ทั้งหมดของท่าน (${profile.comment_count} ข้อความ)`}
                <br />
                <strong>{locale === 'en' ? 'Consent audit log will be kept 5 years' : 'audit log การยินยอมจะถูกเก็บ 5 ปี'}</strong>
                {' '}{locale === 'en' ? '(anonymized, per legal requirement)' : 'ตามข้อกำหนดกฎหมาย (โดยไม่มีข้อมูลระบุตัวตน)'}
              </p>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                  {deleting ? `${t('common.delete')}...` : t('account.delete_confirm')}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 border text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {locale === 'en' ? 'See also' : 'ดูเพิ่มเติม'}: <Link href="/privacy-policy" className="text-blue-600 underline">{t('footer.privacy')}</Link>
        {' · '}<Link href="/terms" className="text-blue-600 underline">{t('footer.terms')}</Link>
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5 border-b last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right">{children}</span>
    </div>
  );
}
