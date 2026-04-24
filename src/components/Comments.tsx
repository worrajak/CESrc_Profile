'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_deleted: boolean;
  guest_user?: {
    display_name: string;
    user_type: string;
    institution: string | null;
  };
}

type TargetType = 'news' | 'publication' | 'researcher' | 'grant' | 'equipment';

interface CommentsProps {
  targetType: TargetType;
  targetId: string;
}

const USER_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  student: { label: '🎓 นักศึกษา', color: 'bg-blue-100 text-blue-700' },
  researcher: { label: '🔬 นักวิจัย', color: 'bg-violet-100 text-violet-700' },
  general: { label: '👤 ผู้เยี่ยมชม', color: 'bg-slate-100 text-slate-700' },
};

export default function Comments({ targetType, targetId }: CommentsProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        id, user_id, content, created_at, is_deleted,
        guest_user:guest_users!user_id (display_name, user_type, institution)
      `)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    setComments((data as unknown as Comment[]) || []);
    setLoading(false);
  }, [targetType, targetId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${targetType}-${targetId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `target_id=eq.${targetId}`,
      }, () => fetchComments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [targetType, targetId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (!newContent.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      content: newContent.trim(),
    });

    if (!error) {
      setNewContent('');
      fetchComments();

      // Track engagement event (anonymous)
      try {
        await fetch('/api/engagement/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'comment',
            target_type: targetType,
            target_id: targetId,
            page_path: window.location.pathname,
          }),
        });
      } catch { /* ignore */ }
    } else {
      alert('ไม่สามารถส่ง comment: ' + error.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('ลบ comment นี้?')) return;
    await supabase
      .from('comments')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: 'user' })
      .eq('id', commentId);
    fetchComments();
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          💬 <span>ความคิดเห็น</span>
          <span className="text-sm font-normal text-gray-400">({comments.length})</span>
        </h2>
      </div>

      {/* Comment Input */}
      {user && profile ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={2000}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm resize-none min-h-[80px]"
                placeholder={`เขียนความคิดเห็นในฐานะ ${profile.display_name}...`}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-400">{newContent.length}/2000</span>
                <button type="submit" disabled={submitting || !newContent.trim()}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-40 transition">
                  {submitting ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-5 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <p className="text-sm text-emerald-900">
              <strong>Login ด้วย Google</strong> เพื่อแสดงความคิดเห็น — ปลอดภัย PDPA
            </p>
          </div>
          <button onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">กำลังโหลด...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-xl">
          ยังไม่มีความคิดเห็น — เป็นคนแรกกันเลย!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const gu = c.guest_user;
            const badge = gu ? USER_TYPE_BADGE[gu.user_type] || USER_TYPE_BADGE.general : null;
            const isOwner = user?.id === c.user_id;
            const date = new Date(c.created_at);
            return (
              <div key={c.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(gu?.display_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm text-gray-800">{gu?.display_name || 'ผู้ใช้'}</span>
                    {badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                    {gu?.institution && (
                      <span className="text-[10px] text-gray-500">· {gu.institution}</span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {date.toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{c.content}</p>
                </div>
                {isOwner && (
                  <button onClick={() => handleDelete(c.id)}
                    className="text-[10px] text-red-500 hover:text-red-700 flex-shrink-0">
                    ลบ
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t">
        Comments ของท่านเป็นไปตาม{' '}
        <Link href="/terms" className="text-blue-600 hover:underline">ข้อกำหนดการใช้งาน</Link>
        {' · '}
        <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        {' · '}
        Admin สามารถลบ comment ที่ไม่เหมาะสมได้
      </p>
    </section>
  );
}
