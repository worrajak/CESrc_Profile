'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/admin-auth-client';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
  tags: string[];
  sdg_goals: string[];
  is_official_travel?: boolean;
  travel_location?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  news_images: { id: string; image_url: string; caption: string | null }[];
}

interface SimpleResearcher {
  id: string;
  first_name_th: string;
  last_name_th: string;
  first_name_en: string | null;
}

const categoryOptions = [
  { value: 'team_activity', label: 'กิจกรรมทีม CESrc' },
  { value: 'energy_news', label: 'ข่าวสารพลังงาน' },
  { value: 'academic', label: 'ข่าววิชาการ' },
  { value: 'announcement', label: 'ประกาศทั่วไป' },
];

const TRAVEL_ACTIVITY_TYPES = [
  { value: 'conference', label: '🎤 ประชุมวิชาการ / Conference' },
  { value: 'seminar', label: '💼 สัมมนา / Seminar' },
  { value: 'training', label: '📚 อบรม / Training' },
  { value: 'field_work', label: '🔬 ภาคสนาม / Field Work' },
  { value: 'meeting', label: '🗣️ ประชุม / Meeting' },
  { value: 'inspection', label: '🔍 ตรวจสอบ / Inspection' },
  { value: 'exhibition', label: '🎪 นิทรรศการ / Exhibition' },
  { value: 'consulting', label: '💡 ที่ปรึกษา / Consulting' },
  { value: 'other', label: '📌 อื่นๆ' },
];

const SDG_COLORS: Record<string, string> = {
  'SDG 1': 'bg-red-600', 'SDG 2': 'bg-yellow-600', 'SDG 3': 'bg-green-600',
  'SDG 4': 'bg-red-700', 'SDG 5': 'bg-orange-500', 'SDG 6': 'bg-cyan-500',
  'SDG 7': 'bg-yellow-500', 'SDG 8': 'bg-rose-700', 'SDG 9': 'bg-orange-600',
  'SDG 10': 'bg-pink-600', 'SDG 11': 'bg-amber-600', 'SDG 12': 'bg-amber-700',
  'SDG 13': 'bg-green-700', 'SDG 14': 'bg-blue-600', 'SDG 15': 'bg-lime-600',
  'SDG 16': 'bg-blue-800', 'SDG 17': 'bg-blue-900',
};

export default function AdminNewsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('team_activity');
  const [coverUrl, setCoverUrl] = useState('');
  const [images, setImages] = useState<{ url: string; caption: string }[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sdgGoals, setSdgGoals] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [sdgList, setSdgList] = useState<{ id: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [message, setMessage] = useState('');

  // Travel fields
  const [isOfficialTravel, setIsOfficialTravel] = useState(false);
  const [travelPurpose, setTravelPurpose] = useState('');
  const [travelLocation, setTravelLocation] = useState('');
  const [travelStartDate, setTravelStartDate] = useState('');
  const [travelEndDate, setTravelEndDate] = useState('');
  const [travelActivityType, setTravelActivityType] = useState('conference');
  const [travelApprovalNumber, setTravelApprovalNumber] = useState('');
  const [travelApprovalDocUrl, setTravelApprovalDocUrl] = useState('');
  const [travelApprovalLink, setTravelApprovalLink] = useState('');
  const [travelBudget, setTravelBudget] = useState('');
  const [travelFundingSource, setTravelFundingSource] = useState('');
  const [travelParticipants, setTravelParticipants] = useState<string[]>([]);
  const [researchers, setResearchers] = useState<SimpleResearcher[]>([]);
  const [authorId, setAuthorId] = useState<string>('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
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
        fetchNews();
        fetchTagOptions();
        fetchResearchers();
      } else {
        setAuthError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setAuthError('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const { role: adminRole, loading: adminRoleLoading } = useAdminAuth();

  useEffect(() => {
    if (adminRoleLoading) return;
    const supabaseOK = adminRole === 'admin' || adminRole === 'superadmin' || adminRole === 'legacy';
    const storedPwd = sessionStorage.getItem('admin_pwd');
    const legacyOK = sessionStorage.getItem('admin_auth') === 'true' && storedPwd;
    if (supabaseOK || legacyOK) {
      setAuthenticated(true);
      if (storedPwd) setPassword(storedPwd);
      fetchNews();
      fetchTagOptions();
      fetchResearchers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminRole, adminRoleLoading]);

  const fetchResearchers = async () => {
    try {
      const res = await fetch('/api/researchers');
      if (res.ok) {
        const data = await res.json();
        setResearchers(data || []);
      }
    } catch { /* ignore */ }
  };

  const getPassword = () => sessionStorage.getItem('admin_pwd') || password;

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news?limit=50');
      const data = await res.json();
      setNewsList(data.news || []);
    } catch { /* ignore */ }
  };

  const fetchTagOptions = async () => {
    try {
      const res = await fetch('/api/news/suggest-tags');
      const data = await res.json();
      setAvailableTags(data.available_tags || []);
      setSdgList(data.sdg_list || []);
    } catch { /* ignore */ }
  };

  // Auto-suggest tags from title + content
  const handleAutoSuggest = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    setSuggesting(true);
    try {
      const res = await fetch('/api/news/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.tags) {
        setTags((prev) => Array.from(new Set([...prev, ...data.tags])));
      }
      if (data.sdg_goals) {
        setSdgGoals((prev) => Array.from(new Set([...prev, ...data.sdg_goals])));
      }
    } catch { /* ignore */ }
    finally { setSuggesting(false); }
  }, [title, content]);

  // Upload image
  const handleUpload = async (file: File, isCover: boolean) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', getPassword());
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        if (isCover) setCoverUrl(data.url);
        else if (images.length < 4) setImages([...images, { url: data.url, caption: '' }]);
      } else {
        setMessage('อัพโหลดไม่สำเร็จ: ' + (data.error || 'unknown error'));
      }
    } catch { setMessage('อัพโหลดไม่สำเร็จ'); }
    finally { setUploading(false); }
  };

  // Upload approval document (PDF)
  const handleUploadDoc = async (file: File) => {
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', getPassword());
      formData.append('folder', 'travel-approvals');
      formData.append('type', 'document');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setTravelApprovalDocUrl(data.url);
      } else {
        setMessage('อัพโหลด PDF ไม่สำเร็จ: ' + (data.error || 'unknown error'));
      }
    } catch { setMessage('อัพโหลด PDF ไม่สำเร็จ'); }
    finally { setUploadingDoc(false); }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setContent(''); setCategory('team_activity');
    setCoverUrl(''); setImages([]); setTags([]); setSdgGoals([]);
    setIsOfficialTravel(false);
    setTravelPurpose(''); setTravelLocation('');
    setTravelStartDate(''); setTravelEndDate('');
    setTravelActivityType('conference');
    setTravelApprovalNumber(''); setTravelApprovalDocUrl(''); setTravelApprovalLink('');
    setTravelBudget(''); setTravelFundingSource(''); setTravelParticipants([]);
    setAuthorId('');
    setMessage('');
  };

  // Start editing an existing news item — fetch full record + populate form
  const startEdit = async (id: string) => {
    setMessage('');
    try {
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) throw new Error('Failed to load news');
      const { news: n } = await res.json();
      if (!n) throw new Error('News not found');

      setEditingId(id);
      setTitle(n.title || '');
      setContent(n.content || '');
      setCategory(n.category || 'team_activity');
      setCoverUrl(n.cover_image_url || '');
      setTags(n.tags || []);
      setSdgGoals(n.sdg_goals || []);
      setAuthorId(n.author_id || '');
      setImages(
        (n.news_images || [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((im: any) => ({ url: im.image_url, caption: im.caption || '' })),
      );

      // Travel fields
      setIsOfficialTravel(!!n.is_official_travel);
      setTravelPurpose(n.travel_purpose || '');
      setTravelLocation(n.travel_location || '');
      setTravelStartDate(n.travel_start_date || '');
      setTravelEndDate(n.travel_end_date || '');
      setTravelActivityType(n.travel_activity_type || 'conference');
      setTravelApprovalNumber(n.travel_approval_number || '');
      setTravelApprovalDocUrl(n.travel_approval_doc_url || '');
      setTravelApprovalLink(n.travel_approval_link || '');
      setTravelBudget(n.travel_budget != null ? String(n.travel_budget) : '');
      setTravelFundingSource(n.travel_funding_source || '');
      setTravelParticipants(n.travel_participants || []);

      setShowForm(true);
      // Scroll form into view smoothly
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    } catch (e: any) {
      setMessage('โหลดข่าวเพื่อแก้ไขไม่สำเร็จ: ' + (e.message || ''));
    }
  };

  const toggleParticipant = (rid: string) => {
    setTravelParticipants((prev) =>
      prev.includes(rid) ? prev.filter((p) => p !== rid) : [...prev, rid]
    );
  };

  // Save news
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage('กรุณากรอกหัวข้อและเนื้อหา');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        password: getPassword(),
        title, content, category,
        author_id: authorId || null,
        cover_image_url: coverUrl || null,
        images: images.filter((img) => img.url),
        tags,
        sdg_goals: sdgGoals,
        is_official_travel: isOfficialTravel,
        travel_purpose: isOfficialTravel ? travelPurpose : null,
        travel_location: isOfficialTravel ? travelLocation : null,
        travel_start_date: isOfficialTravel ? travelStartDate : null,
        travel_end_date: isOfficialTravel ? travelEndDate : null,
        travel_activity_type: isOfficialTravel ? travelActivityType : null,
        travel_approval_number: isOfficialTravel ? travelApprovalNumber : null,
        travel_approval_doc_url: isOfficialTravel ? travelApprovalDocUrl : null,
        travel_approval_link: isOfficialTravel ? travelApprovalLink : null,
        travel_budget: isOfficialTravel && travelBudget ? parseFloat(travelBudget) : null,
        travel_funding_source: isOfficialTravel ? travelFundingSource : null,
        travel_participants: isOfficialTravel ? travelParticipants : [],
      };

      const isEdit = !!editingId;
      const res = await fetch(isEdit ? `/api/news/${editingId}` : '/api/news', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage(isEdit ? '✓ แก้ไขข่าวสำเร็จ!' : 'บันทึกข่าวสำเร็จ!');
        resetForm();
        setShowForm(false);
        fetchNews();
      } else {
        const data = await res.json();
        setMessage('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch { setMessage('เกิดข้อผิดพลาดในการบันทึก'); }
    finally { setSaving(false); }
  };

  // Delete news
  const handleDelete = async (id: string) => {
    if (!confirm('ต้องการลบข่าวนี้?')) return;
    try {
      await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: getPassword() }),
      });
      fetchNews();
    } catch { /* ignore */ }
  };

  // Add custom tag
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  // Login form
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin - จัดการข่าวสาร</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="รหัสผ่าน Admin" required />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการข่าวสาร</h1>
          <div className="flex gap-3 mt-2">
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">← กลับ Admin Dashboard</Link>
            <Link href="/news" className="text-sm text-blue-600 hover:underline" target="_blank">ดูหน้าข่าวสาร →</Link>
          </div>
        </div>
        <button onClick={() => {
            if (showForm) { resetForm(); setShowForm(false); }
            else setShowForm(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          {showForm ? 'ยกเลิก' : '+ เขียนข่าวใหม่'}
        </button>
      </div>

      {/* Compose Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-700">
              {editingId ? '✏️ แก้ไขข่าว' : 'เขียนข่าวใหม่'}
            </h2>
            {editingId && (
              <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                ID: {editingId.slice(0, 8)}…
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อข่าว *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="หัวข้อข่าว..." required />
          </div>

          {/* Category + Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ผู้โพสต์ (Author)</label>
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">-- ไม่ระบุ --</option>
                {researchers.map((r) => (
                  <option key={r.id} value={r.id}>{r.first_name_th} {r.last_name_th}</option>
                ))}
              </select>
            </div>
          </div>

          {/* === TRAVEL SECTION === */}
          <div className="border-2 border-dashed border-emerald-300 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isOfficialTravel}
                onChange={(e) => setIsOfficialTravel(e.target.checked)}
                className="w-4 h-4 rounded" />
              <span className="font-semibold text-emerald-800">
                ✈️ เป็นการเดินทางไปราชการ
              </span>
              <span className="text-xs text-emerald-600">(สำหรับประเมินภาระงาน)</span>
            </label>

            {isOfficialTravel && (
              <div className="mt-4 space-y-3">
                {/* Activity Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ประเภทกิจกรรม</label>
                  <select value={travelActivityType} onChange={(e) => setTravelActivityType(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-sm">
                    {TRAVEL_ACTIVITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">วัตถุประสงค์</label>
                  <input type="text" value={travelPurpose} onChange={(e) => setTravelPurpose(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                    placeholder="เช่น นำเสนองานวิจัยในงาน IEEE ECTI-CON 2026" />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">สถานที่</label>
                  <input type="text" value={travelLocation} onChange={(e) => setTravelLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                    placeholder="เช่น โรงแรม Shangri-La, กรุงเทพฯ หรือ Tokyo, Japan" />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">วันที่เริ่ม</label>
                    <input type="date" value={travelStartDate} onChange={(e) => setTravelStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                    <input type="date" value={travelEndDate} onChange={(e) => setTravelEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                  </div>
                </div>

                {/* Approval Number + Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">เลขที่หนังสืออนุมัติ</label>
                    <input type="text" value={travelApprovalNumber} onChange={(e) => setTravelApprovalNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                      placeholder="เช่น ศธ 0584.17/ว.123" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">งบประมาณ (บาท)</label>
                    <input type="number" value={travelBudget} onChange={(e) => setTravelBudget(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                      placeholder="เช่น 15000" step="0.01" />
                  </div>
                </div>

                {/* Funding Source */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">แหล่งงบประมาณ</label>
                  <input type="text" value={travelFundingSource} onChange={(e) => setTravelFundingSource(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                    placeholder="เช่น เงินรายได้ มทร.ล้านนา 2569 หรือ ทุน บพข. รหัส..." />
                </div>

                {/* Approval Document Upload + External Link */}
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <label className="block text-xs font-semibold text-emerald-800 mb-2">
                    📎 เอกสารอนุมัติเดินทาง
                  </label>
                  <div className="space-y-2">
                    {/* PDF Upload */}
                    <div className="flex items-center gap-2">
                      <input type="text" value={travelApprovalDocUrl}
                        onChange={(e) => setTravelApprovalDocUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 border rounded-lg text-xs"
                        placeholder="URL ของ PDF หรือกดปุ่มอัพโหลด →" />
                      <input ref={docInputRef} type="file" accept="application/pdf,.pdf,.doc,.docx" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadDoc(f); }} />
                      <button type="button" onClick={() => docInputRef.current?.click()} disabled={uploadingDoc}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs whitespace-nowrap disabled:opacity-50">
                        {uploadingDoc ? 'กำลังอัพ...' : '📄 อัพโหลด PDF'}
                      </button>
                    </div>
                    {travelApprovalDocUrl && (
                      <div className="flex items-center gap-2 text-xs bg-emerald-50 rounded px-2 py-1">
                        <span>✅</span>
                        <a href={travelApprovalDocUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline truncate flex-1">
                          ดูเอกสาร
                        </a>
                        <button type="button" onClick={() => setTravelApprovalDocUrl('')}
                          className="text-red-500 hover:text-red-700 text-xs">ลบ</button>
                      </div>
                    )}

                    {/* External Link */}
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">หรือลิงก์ภายนอก (Google Drive, SharePoint)</label>
                      <input type="url" value={travelApprovalLink} onChange={(e) => setTravelApprovalLink(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-lg text-xs"
                        placeholder="https://drive.google.com/..." />
                    </div>
                  </div>
                </div>

                {/* Team Members (Participants) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ผู้ร่วมเดินทาง (เลือกจากสมาชิกหน่วย — {travelParticipants.length} คน)
                  </label>
                  <div className="max-h-40 overflow-y-auto bg-white rounded-lg border p-2 grid grid-cols-2 md:grid-cols-3 gap-1">
                    {researchers.map((r) => (
                      <label key={r.id} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-emerald-50 rounded px-1 py-0.5">
                        <input type="checkbox"
                          checked={travelParticipants.includes(r.id)}
                          onChange={() => toggleParticipant(r.id)}
                          className="w-3 h-3 rounded" />
                        <span>{r.first_name_th} {r.last_name_th}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
                  💡 <strong>ประโยชน์:</strong> ข้อมูลนี้จะถูกใช้ในการประเมินภาระงานและสรุปเป็น Progress Report อัตโนมัติ
                  — ดูได้ที่ <code className="bg-blue-100 px-1 rounded">/admin/workload</code>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหา *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[200px]"
              placeholder="เนื้อหาข่าว..." required />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Tags (คำสำคัญ)</label>
              <button type="button" onClick={handleAutoSuggest} disabled={suggesting}
                className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition disabled:opacity-50">
                {suggesting ? 'กำลังวิเคราะห์...' : 'แนะนำอัตโนมัติ'}
              </button>
            </div>
            {/* Selected tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))}
                    className="text-blue-400 hover:text-blue-600 font-bold">x</button>
                </span>
              ))}
            </div>
            {/* Tag input + available tags */}
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                placeholder="พิมพ์ tag แล้วกด Enter หรือเลือกด้านล่าง" />
            </div>
            {/* Quick-add available tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {availableTags.filter((t) => !tags.includes(t)).map((tag) => (
                <button key={tag} type="button" onClick={() => addTag(tag)}
                  className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-700 transition">
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* SDG Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SDGs (เป้าหมายการพัฒนาที่ยั่งยืน)</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
              {sdgList.map((sdg) => {
                const selected = sdgGoals.includes(sdg.id);
                return (
                  <button key={sdg.id} type="button"
                    onClick={() => {
                      if (selected) setSdgGoals(sdgGoals.filter((s) => s !== sdg.id));
                      else setSdgGoals([...sdgGoals, sdg.id]);
                    }}
                    className={`text-[10px] py-1.5 px-1 rounded-lg border text-center transition ${
                      selected
                        ? `${SDG_COLORS[sdg.id] || 'bg-blue-600'} text-white border-transparent`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-bold">{sdg.id.replace('SDG ', '')}</div>
                    <div className="leading-tight">{sdg.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปปก</label>
            <div className="flex items-center gap-3">
              <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
                placeholder="URL รูปปก หรือกดอัพโหลด →" />
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, true); }} />
              <button type="button" onClick={() => coverInputRef.current?.click()} disabled={uploading}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm whitespace-nowrap">
                {uploading ? 'กำลังอัพ...' : 'อัพโหลด'}
              </button>
            </div>
            {coverUrl && (
              <div className="mt-2 relative inline-block">
                <img src={coverUrl} alt="Cover" className="h-32 object-cover rounded-lg" />
                <button type="button" onClick={() => setCoverUrl('')}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs">x</button>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพประกอบ ({images.length}/4)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                  <input type="text" value={img.caption}
                    onChange={(e) => { const n = [...images]; n[idx].caption = e.target.value; setImages(n); }}
                    className="w-full mt-1 px-2 py-1 border rounded text-xs" placeholder="คำอธิบาย..." />
                  <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs">x</button>
                </div>
              ))}
              {images.length < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition">
                  {uploading ? 'กำลังอัพ...' : '+ เพิ่มรูป'}
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, false); }} />
          </div>

          {/* Submit */}
          {message && (
            <p className={`text-sm ${message.includes('สำเร็จ') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving
                ? (editingId ? 'กำลังบันทึกการแก้ไข...' : 'กำลังบันทึก...')
                : (editingId ? '💾 บันทึกการแก้ไข' : 'เผยแพร่ข่าว')}
            </button>
            {editingId && (
              <button type="button"
                onClick={() => { resetForm(); setShowForm(false); }}
                disabled={saving}
                className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      )}

      {/* News List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">ข่าวทั้งหมด ({newsList.length})</h2>
        </div>
        {newsList.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            ยังไม่มีข่าว — กดปุ่ม &quot;+ เขียนข่าวใหม่&quot; เพื่อเริ่มต้น
          </div>
        ) : (
          <div className="divide-y">
            {newsList.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {item.cover_image_url && (
                    <img src={item.cover_image_url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {categoryOptions.find((c) => c.value === item.category)?.label || item.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.published_at).toLocaleDateString('th-TH')}
                      </span>
                      {item.is_official_travel && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded flex items-center gap-1">
                          ✈️ ไปราชการ
                          {item.travel_location && <span className="opacity-70">· {item.travel_location}</span>}
                        </span>
                      )}
                    </div>
                    {/* Tags & SDGs */}
                    {((item.tags && item.tags.length > 0) || (item.sdg_goals && item.sdg_goals.length > 0)) && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.tags?.map((tag) => (
                          <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                        {item.sdg_goals?.map((sdg) => (
                          <span key={sdg} className={`text-[10px] text-white px-1.5 py-0.5 rounded ${SDG_COLORS[sdg] || 'bg-blue-600'}`}>{sdg}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/news/${item.id}`} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100" target="_blank">ดู</Link>
                    <button
                      onClick={() => startEdit(item.id)}
                      className="px-3 py-1 text-xs bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
                      title="แก้ไขข่าว เปลี่ยนรูป แก้ตัวสะกด"
                    >
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">ลบ</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
