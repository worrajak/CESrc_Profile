'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
  tags: string[];
  sdg_goals: string[];
  news_images: { id: string; image_url: string; caption: string | null }[];
}

const categoryOptions = [
  { value: 'team_activity', label: 'กิจกรรมทีม CESrc' },
  { value: 'energy_news', label: 'ข่าวสารพลังงาน' },
  { value: 'academic', label: 'ข่าววิชาการ' },
  { value: 'announcement', label: 'ประกาศทั่วไป' },
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
      } else {
        setAuthError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setAuthError('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedPwd = sessionStorage.getItem('admin_pwd');
    if (sessionStorage.getItem('admin_auth') === 'true' && storedPwd) {
      setAuthenticated(true);
      setPassword(storedPwd);
      fetchNews();
      fetchTagOptions();
    }
  }, []);

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
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getPassword(),
          title, content, category,
          cover_image_url: coverUrl || null,
          images: images.filter((img) => img.url),
          tags,
          sdg_goals: sdgGoals,
        }),
      });
      if (res.ok) {
        setMessage('บันทึกข่าวสำเร็จ!');
        setTitle(''); setContent(''); setCategory('team_activity');
        setCoverUrl(''); setImages([]); setTags([]); setSdgGoals([]);
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
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          {showForm ? 'ยกเลิก' : '+ เขียนข่าวใหม่'}
        </button>
      </div>

      {/* Compose Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">เขียนข่าวใหม่</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อข่าว *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="หัวข้อข่าว..." required />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
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
          <button type="submit" disabled={saving}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'กำลังบันทึก...' : 'เผยแพร่ข่าว'}
          </button>
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
