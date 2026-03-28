'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  cover_image_url: string | null;
  published_at: string;
  news_images: { id: string; image_url: string; caption: string | null }[];
}

const categoryOptions = [
  { value: 'team_activity', label: 'กิจกรรมทีม CESrc' },
  { value: 'energy_news', label: 'ข่าวสารพลังงาน' },
  { value: 'academic', label: 'ข่าววิชาการ' },
  { value: 'announcement', label: 'ประกาศทั่วไป' },
];

export default function AdminNewsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // News list
  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('team_activity');
  const [coverUrl, setCoverUrl] = useState('');
  const [images, setImages] = useState<{ url: string; caption: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    }
  }, []);

  const getPassword = () => sessionStorage.getItem('admin_pwd') || password;

  // Fetch news list
  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news?limit=50');
      const data = await res.json();
      setNewsList(data.news || []);
    } catch { /* ignore */ }
  };

  // Upload image
  const handleUpload = async (file: File, isCover: boolean) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', getPassword());

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (isCover) {
          setCoverUrl(data.url);
        } else {
          if (images.length < 4) {
            setImages([...images, { url: data.url, caption: '' }]);
          }
        }
      } else {
        setMessage('อัพโหลดไม่สำเร็จ: ' + (data.error || 'unknown error'));
      }
    } catch {
      setMessage('อัพโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
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
          title,
          content,
          category,
          cover_image_url: coverUrl || null,
          images: images.filter((img) => img.url),
        }),
      });

      if (res.ok) {
        setMessage('บันทึกข่าวสำเร็จ!');
        setTitle('');
        setContent('');
        setCategory('team_activity');
        setCoverUrl('');
        setImages([]);
        setShowForm(false);
        fetchNews();
      } else {
        const data = await res.json();
        setMessage('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch {
      setMessage('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
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

  // Login form
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Admin - จัดการข่าวสาร
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="รหัสผ่าน Admin"
              required
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
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
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">
              ← กลับ Admin Dashboard
            </Link>
            <Link href="/news" className="text-sm text-blue-600 hover:underline" target="_blank">
              ดูหน้าข่าวสาร →
            </Link>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
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
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="หัวข้อข่าว..."
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เนื้อหา *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[200px]"
              placeholder="เนื้อหาข่าว... (แต่ละบรรทัดจะแสดงเป็นย่อหน้า)"
              required
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รูปปก</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
                placeholder="URL รูปปก หรือกดอัพโหลด →"
              />
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, true);
                }}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm whitespace-nowrap"
              >
                {uploading ? 'กำลังอัพ...' : 'อัพโหลด'}
              </button>
            </div>
            {coverUrl && (
              <div className="mt-2 relative">
                <img src={coverUrl} alt="Cover" className="h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setCoverUrl('')}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                >
                  x
                </button>
              </div>
            )}
          </div>

          {/* Additional Images (max 4) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพประกอบ ({images.length}/4)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[idx].caption = e.target.value;
                      setImages(newImages);
                    }}
                    className="w-full mt-1 px-2 py-1 border rounded text-xs"
                    placeholder="คำอธิบาย..."
                  />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    x
                  </button>
                </div>
              ))}

              {images.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition"
                >
                  {uploading ? 'กำลังอัพ...' : '+ เพิ่มรูป'}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file, false);
              }}
            />
          </div>

          {/* Submit */}
          {message && (
            <p className={`text-sm ${message.includes('สำเร็จ') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
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
              <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                {item.cover_image_url && (
                  <img
                    src={item.cover_image_url}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {categoryOptions.find((c) => c.value === item.category)?.label || item.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.published_at).toLocaleDateString('th-TH')}
                    </span>
                    {item.news_images?.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {item.news_images.length} รูป
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/news/${item.id}`}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    target="_blank"
                  >
                    ดู
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
