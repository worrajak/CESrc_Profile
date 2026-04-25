'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const LEVEL_MAP: Record<string, { label: string; color: string }> = {
  beginner: { label: 'เริ่มต้น', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'กลาง', color: 'bg-blue-100 text-blue-700' },
  advanced: { label: 'สูง', color: 'bg-purple-100 text-purple-700' },
  professional: { label: 'วิชาชีพ', color: 'bg-amber-100 text-amber-700' },
};

const ACTIVITY_ICONS: Record<string, string> = {
  registration: '📝',
  lecture: '📚',
  workshop: '🔧',
  break: '☕',
  exam: '📝',
  field_trip: '🚌',
  ceremony: '🎓',
};

const EVAL_METHOD_ICONS: Record<string, string> = {
  'ข้อเขียน': '📝',
  'ปฏิบัติ': '🔧',
  'โครงงาน': '📋',
  'สังเกต': '👁️',
  'นำเสนอ': '🎤',
  'แบบทดสอบ': '✏️',
};

interface AIProviderInfo {
  provider: string;
  name: string;
  models: string[];
}

export default function AdminTrainingPage() {
  // Course list
  const [courses, setCourses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Import
  const [showImporter, setShowImporter] = useState(false);
  const [providers, setProviders] = useState<AIProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [parsing, setParsing] = useState(false);
  const [parsedCourse, setParsedCourse] = useState<any>(null);
  const [parseError, setParseError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Tab for preview
  const [previewTab, setPreviewTab] = useState<'overview' | 'schedule' | 'modules' | 'evaluation'>('overview');

  // Researchers list for instructor dropdown
  const [researchers, setResearchers] = useState<any[]>([]);

  // Edit/Add form
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '', title_th: '', title_en: '', description_th: '',
    level: 'intermediate', skill_domain: 'other',
    duration_hours: 0, duration_days: 0,
    fee_external: 0, fee_student: 0, fee_internal: 0,
    instructor_name: '', is_active: true,
  });
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [formModules, setFormModules] = useState<any[]>([]);
  const [formSessions, setFormSessions] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    fetchProviders();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const [coursesRes, sessionsRes, researchersRes] = await Promise.all([
        supabase.from('training_courses').select('*').order('created_at', { ascending: false }),
        supabase.from('training_sessions').select('*').order('start_date', { ascending: false }),
        supabase.from('researchers').select('id, title_th, first_name_th, last_name_th, first_name_en, last_name_en, position').order('last_name_th'),
      ]);

      setCourses(coursesRes.data || []);
      setSessions(sessionsRes.data || []);
      setResearchers(researchersRes.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/services/parse-course');
      if (res.ok) {
        const data = await res.json();
        const provs = data.providers instanceof Promise ? await data.providers : data.providers;
        setProviders(Array.isArray(provs) ? provs : []);
        if (Array.isArray(provs) && provs.length > 0) {
          setSelectedProvider(provs[0].provider);
          setSelectedModel(provs[0].models?.[0] || '');
        }
      }
    } catch {}
  };

  // AI Parse
  const handleParse = async () => {
    setParsing(true);
    setParsedCourse(null);
    setParseError('');

    try {
      const formData = new FormData();
      if (inputMode === 'file' && courseFile) {
        formData.append('file', courseFile);
      } else if (inputMode === 'text' && textInput.trim()) {
        formData.append('text', textInput);
      } else {
        setParseError('กรุณาอัพโหลดไฟล์หรือใส่ข้อมูลหลักสูตร');
        setParsing(false);
        return;
      }

      if (selectedProvider) formData.append('ai_provider', selectedProvider);
      if (selectedModel) formData.append('ai_model', selectedModel);

      const res = await fetch('/api/services/parse-course', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok && data.course) {
        setParsedCourse(data);
        setPreviewTab('overview');
      } else {
        setParseError(data.error || 'ไม่สามารถวิเคราะห์เอกสารได้');
      }
    } catch (err: any) {
      setParseError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setParsing(false);
    }
  };

  // Save parsed course to DB
  const handleSaveParsed = async () => {
    if (!parsedCourse?.course) return;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const c = parsedCourse.course;

      // Insert course
      const { data: courseData, error: courseError } = await supabase
        .from('training_courses')
        .insert({
          code: 'AI-' + Date.now().toString(36).toUpperCase(),
          title_th: c.title,
          title_en: c.title_en || null,
          description_th: c.description,
          level: c.level || 'intermediate',
          duration_hours: c.total_hours || 0,
          duration_days: c.duration_days || Math.ceil((c.total_hours || 0) / 6),
          skill_domain: c.skill_domain || 'other',
          fee_external: c.fee || 0,
          is_active: true,
        })
        .select()
        .single();

      if (courseError || !courseData) {
        alert(`ไม่สามารถบันทึกหลักสูตรได้: ${courseError?.message || 'unknown error'}\n\nลอง run supabase/029_fix_grants_rls.sql`);
        return;
      }

      // Insert modules + competencies + indicators
      let modCount = 0, compCount = 0, indCount = 0;

      for (const mod of c.modules || []) {
        const { data: moduleData } = await supabase
          .from('course_modules')
          .insert({
            course_id: courseData.id,
            module_number: mod.module_number,
            title: mod.title,
            description: mod.description,
            hours: mod.hours,
            is_practical: mod.is_practical || false,
          })
          .select()
          .single();

        if (moduleData) {
          modCount++;
          for (const comp of mod.competencies || []) {
            const { data: compData } = await supabase
              .from('module_competencies')
              .insert({
                module_id: moduleData.id,
                name: comp.name,
                description: comp.description,
                competency_type: comp.competency_type || 'knowledge',
              })
              .select()
              .single();

            if (compData) {
              compCount++;
              for (const ind of comp.indicators || []) {
                const { error: indErr } = await supabase.from('competency_indicators').insert({
                  competency_id: compData.id,
                  name: ind.name,
                  weight: ind.weight || 25,
                  rubric_excellent: ind.rubric_excellent,
                  rubric_good: ind.rubric_good,
                  rubric_fair: ind.rubric_fair,
                  rubric_poor: ind.rubric_poor,
                });
                if (!indErr) indCount++;
              }
            }
          }
        }
      }

      // If schedule has dates, create a training session
      if (c.schedule?.length > 0 && c.schedule[0].date) {
        const firstDay = c.schedule[0];
        const lastDay = c.schedule[c.schedule.length - 1];
        await supabase.from('training_sessions').insert({
          course_id: courseData.id,
          session_code: courseData.code + '-01',
          batch_number: 1,
          start_date: firstDay.date,
          end_date: lastDay.date || firstDay.date,
          status: 'planned',
          max_participants: 30,
        });
      }

      alert(`บันทึกสำเร็จ!\n\nหลักสูตร: ${c.title}\n${modCount} โมดูล · ${compCount} สมรรถนะ · ${indCount} ตัวชี้วัด`);
      setParsedCourse(null);
      setCourseFile(null);
      setTextInput('');
      setShowImporter(false);
      fetchData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + (err.message || 'unknown'));
    }
  };

  // Delete course
  const handleDelete = async (courseId: string, title: string) => {
    if (!confirm(`ลบหลักสูตร "${title}" ?`)) return;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      await supabase.from('training_courses').delete().eq('id', courseId);
      fetchData();
    } catch {}
  };

  // Toggle active
  const handleToggleActive = async (courseId: string, currentActive: boolean) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      await supabase.from('training_courses').update({ is_active: !currentActive }).eq('id', courseId);
      fetchData();
    } catch {}
  };

  // Open add form
  const handleAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: '', title_th: '', title_en: '', description_th: '',
      level: 'intermediate', skill_domain: 'other',
      duration_hours: 0, duration_days: 0,
      fee_external: 0, fee_student: 0, fee_internal: 0,
      instructor_name: '', is_active: true,
    });
    setSelectedInstructors([]);
    setFormModules([]);
    setFormSessions([]);
    setShowForm(true);
  };

  // Open edit form — load course + modules + sessions
  const handleEdit = async (courseItem: any) => {
    setEditingCourse(courseItem);
    setFormData({
      code: courseItem.code || '',
      title_th: courseItem.title_th || '',
      title_en: courseItem.title_en || '',
      description_th: courseItem.description_th || '',
      level: courseItem.level || 'intermediate',
      skill_domain: courseItem.skill_domain || 'other',
      duration_hours: courseItem.duration_hours || 0,
      duration_days: courseItem.duration_days || 0,
      fee_external: courseItem.fee_external || 0,
      fee_student: courseItem.fee_student || 0,
      fee_internal: courseItem.fee_internal || 0,
      instructor_name: courseItem.instructor_name || '',
      is_active: courseItem.is_active ?? true,
    });
    setSelectedInstructors(
      Array.isArray(courseItem.instructor_ids) ? courseItem.instructor_ids : []
    );
    setShowForm(true);
    setLoadingDetail(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const [modsRes, sessRes] = await Promise.all([
        supabase.from('course_modules').select('*').eq('course_id', courseItem.id).order('module_number'),
        supabase.from('training_sessions').select('*').eq('course_id', courseItem.id).order('batch_number'),
      ]);

      setFormModules(modsRes.data || []);
      setFormSessions(sessRes.data || []);
    } catch {} finally {
      setLoadingDetail(false);
    }
  };

  // Save course (add or update)
  const handleSaveForm = async () => {
    if (!formData.title_th.trim()) { alert('กรุณากรอกชื่อหลักสูตร'); return; }
    setSaving(true);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const payload = {
        code: formData.code || 'CRS-' + Date.now().toString(36).toUpperCase(),
        title_th: formData.title_th,
        title_en: formData.title_en || null,
        description_th: formData.description_th || null,
        level: formData.level,
        skill_domain: formData.skill_domain,
        duration_hours: formData.duration_hours || null,
        duration_days: formData.duration_days || null,
        fee_external: formData.fee_external || 0,
        fee_student: formData.fee_student || 0,
        fee_internal: formData.fee_internal || 0,
        instructor_name: formData.instructor_name || null,
        instructor_ids: selectedInstructors,
        is_active: formData.is_active,
      };

      if (editingCourse) {
        // Update
        const { error } = await supabase.from('training_courses').update(payload).eq('id', editingCourse.id);
        if (error) { alert('ไม่สามารถอัปเดตได้: ' + error.message); setSaving(false); return; }
      } else {
        // Insert
        const { error } = await supabase.from('training_courses').insert(payload);
        if (error) { alert('ไม่สามารถเพิ่มได้: ' + error.message); setSaving(false); return; }
      }

      setShowForm(false);
      setEditingCourse(null);
      fetchData();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // Add session to course
  const handleAddSession = async () => {
    if (!editingCourse) return;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const nextBatch = formSessions.length + 1;
      const { data, error } = await supabase.from('training_sessions').insert({
        course_id: editingCourse.id,
        session_code: editingCourse.code + '-' + String(nextBatch).padStart(2, '0'),
        batch_number: nextBatch,
        status: 'planned',
        max_participants: 30,
      }).select().single();

      if (data) setFormSessions([...formSessions, data]);
      if (error) alert('ไม่สามารถเพิ่มรุ่นได้: ' + error.message);
    } catch {}
  };

  // Update session
  const handleUpdateSession = async (sessionId: string, updates: any) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      const { error } = await supabase.from('training_sessions').update(updates).eq('id', sessionId);
      if (error) {
        alert('อัปเดตรุ่นอบรมไม่สำเร็จ: ' + error.message);
        return;
      }
      setFormSessions(formSessions.map(s => s.id === sessionId ? { ...s, ...updates } : s));
    } catch (err: any) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('ลบรุ่นนี้?')) return;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      await supabase.from('training_sessions').delete().eq('id', sessionId);
      setFormSessions(formSessions.filter(s => s.id !== sessionId));
    } catch {}
  };

  const currentModels = providers.find(p => p.provider === selectedProvider)?.models || [];
  const course = parsedCourse?.course;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">จัดการหลักสูตรฝึกอบรม</h1>
          <p className="text-gray-500 text-sm">นำเข้าเอกสารหลักสูตร — AI แยกกำหนดการ โมดูล เกณฑ์การวัดและประเมินผลอัตโนมัติ</p>
        </div>
        <div className="flex gap-2">
          <Link href="/services/training" className="border border-purple-300 text-purple-600 px-4 py-2 rounded-lg text-sm hover:bg-purple-50 transition">
            ดูหน้าหลักสูตร
          </Link>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition font-medium"
          >
            + เพิ่มหลักสูตร
          </button>
          <button
            onClick={() => { setShowImporter(!showImporter); setParsedCourse(null); setParseError(''); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition font-medium"
          >
            {showImporter ? 'ปิด' : '📄 นำเข้าด้วย AI'}
          </button>
        </div>
      </div>

      {/* AI Importer */}
      {showImporter && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 mb-8">
          <h3 className="font-bold text-purple-800 mb-1">📄 นำเข้าเอกสารหลักสูตร (AI Auto-parse)</h3>
          <p className="text-xs text-purple-600 mb-4">
            อัพโหลดเล่มหลักสูตร กำหนดการอบรม เอกสารหลักสูตร หรือวาง text — AI จะแยกกำหนดการ โมดูล สมรรถนะ ตัวชี้วัด และเกณฑ์การวัดผลอัตโนมัติ
          </p>

          {/* AI Provider Selection */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-purple-700 mb-2">AI Provider</label>
            <div className="flex flex-wrap gap-2">
              {providers.map((p) => (
                <button
                  key={p.provider}
                  onClick={() => {
                    setSelectedProvider(p.provider);
                    setSelectedModel(p.models?.[0] || '');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedProvider === p.provider
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {currentModels.length > 0 && (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="mt-2 border border-purple-200 rounded-lg px-3 py-1.5 text-xs bg-white"
              >
                {currentModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}
          </div>

          {/* Input Mode Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setInputMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                inputMode === 'file' ? 'bg-purple-600 text-white' : 'bg-white border text-gray-600'
              }`}
            >
              📁 อัพโหลดไฟล์
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                inputMode === 'text' ? 'bg-purple-600 text-white' : 'bg-white border text-gray-600'
              }`}
            >
              📝 วาง Text / พิมพ์
            </button>
          </div>

          {inputMode === 'file' ? (
            <div className="flex gap-3 mb-4">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setCourseFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-medium"
              />
              <button
                onClick={handleParse}
                disabled={!courseFile || parsing}
                className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
              >
                {parsing ? 'AI กำลังวิเคราะห์...' : 'AI วิเคราะห์'}
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                className="w-full border border-purple-200 rounded-lg px-4 py-3 text-sm bg-white"
                placeholder="วางเนื้อหาหลักสูตร กำหนดการ หรือเกณฑ์การประเมินที่นี่..."
              />
              <button
                onClick={handleParse}
                disabled={!textInput.trim() || parsing}
                className="mt-2 bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {parsing ? 'AI กำลังวิเคราะห์...' : 'AI วิเคราะห์'}
              </button>
            </div>
          )}

          {parseError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
              {parseError}
            </div>
          )}

          {/* Parsed Result Preview */}
          {course && (
            <div className="bg-white rounded-xl border shadow-sm mt-4">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 rounded-t-xl text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xl">{course.title}</h4>
                    {course.title_en && <p className="text-indigo-200 text-sm mt-1">{course.title_en}</p>}
                  </div>
                  <div className="text-right text-xs text-indigo-200">
                    <p>AI: {parsedCourse.source} ({parsedCourse.model})</p>
                    <p className="mt-1">
                      {parsedCourse.stats?.modules} โมดูล ·
                      {parsedCourse.stats?.schedule_days > 0 && ` ${parsedCourse.stats.schedule_days} วัน ·`}
                      {' '}{parsedCourse.stats?.competencies} สมรรถนะ ·
                      {' '}{parsedCourse.stats?.indicators} ตัวชี้วัด
                      {parsedCourse.stats?.evaluation_methods > 0 && ` · ${parsedCourse.stats.evaluation_methods} วิธีวัดผล`}
                    </p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-3 mt-3">
                  {course.total_hours > 0 && (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">{course.total_hours} ชม.</span>
                  )}
                  {course.duration_days > 0 && (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">{course.duration_days} วัน</span>
                  )}
                  {course.level && (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">
                      {LEVEL_MAP[course.level]?.label || course.level}
                    </span>
                  )}
                  {course.fee > 0 && (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs">{Number(course.fee).toLocaleString()} บาท</span>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b">
                {[
                  { key: 'overview', label: 'ภาพรวม' },
                  { key: 'schedule', label: `กำหนดการ (${course.schedule?.length || 0} วัน)` },
                  { key: 'modules', label: `โมดูล (${course.modules?.length || 0})` },
                  { key: 'evaluation', label: 'เกณฑ์การวัดผล' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPreviewTab(tab.key as any)}
                    className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
                      previewTab === tab.key
                        ? 'border-purple-600 text-purple-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Overview Tab */}
                {previewTab === 'overview' && (
                  <div className="space-y-4">
                    {course.description && (
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-1">คำอธิบาย</h5>
                        <p className="text-sm text-gray-600">{course.description}</p>
                      </div>
                    )}
                    {course.objectives?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-1">วัตถุประสงค์</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {course.objectives.map((obj: string, i: number) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {course.target_audience && (
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-1">กลุ่มเป้าหมาย</h5>
                        <p className="text-sm text-gray-600">{course.target_audience}</p>
                      </div>
                    )}
                    {course.prerequisites && (
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-1">ความรู้พื้นฐาน</h5>
                        <p className="text-sm text-gray-600">{course.prerequisites}</p>
                      </div>
                    )}
                    {course.instructors?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-2">วิทยากร</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {course.instructors.map((inst: any, i: number) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                              <div className="font-medium text-gray-800">{inst.name}</div>
                              {inst.title && <div className="text-xs text-gray-500">{inst.title}</div>}
                              {inst.organization && <div className="text-xs text-gray-400">{inst.organization}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {course.materials?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 text-sm mb-1">อุปกรณ์/เอกสาร</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {course.materials.map((m: string, i: number) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Schedule Tab */}
                {previewTab === 'schedule' && (
                  <div className="space-y-4">
                    {!course.schedule?.length ? (
                      <p className="text-sm text-gray-400 text-center py-8">ไม่พบกำหนดการในเอกสาร</p>
                    ) : (
                      course.schedule.map((day: any, di: number) => (
                        <div key={di} className="border rounded-lg overflow-hidden">
                          <div className="bg-indigo-50 px-4 py-3 flex items-center justify-between">
                            <div className="font-medium text-indigo-800 text-sm">
                              วันที่ {day.day}
                              {day.date && <span className="ml-2 text-indigo-500 font-normal">({day.date})</span>}
                            </div>
                            <span className="text-xs text-indigo-500">
                              {day.time_start} - {day.time_end}
                            </span>
                          </div>
                          <div className="divide-y">
                            {(day.activities || []).map((act: any, ai: number) => (
                              <div key={ai} className="px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50">
                                <span className="text-xs font-mono text-gray-400 mt-0.5 whitespace-nowrap w-24">
                                  {act.time}
                                </span>
                                <span className="text-base">{ACTIVITY_ICONS[act.type] || '📌'}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-gray-800">{act.activity}</div>
                                  {act.instructor && (
                                    <div className="text-[10px] text-gray-400 mt-0.5">วิทยากร: {act.instructor}</div>
                                  )}
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  act.type === 'workshop' ? 'bg-orange-100 text-orange-700' :
                                  act.type === 'lecture' ? 'bg-blue-100 text-blue-700' :
                                  act.type === 'exam' ? 'bg-red-100 text-red-700' :
                                  act.type === 'break' ? 'bg-gray-100 text-gray-500' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {act.type}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Modules Tab */}
                {previewTab === 'modules' && (
                  <div className="space-y-4">
                    {(course.modules || []).map((mod: any, mi: number) => (
                      <div key={mi} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            M{mod.module_number}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium text-gray-800 text-sm">{mod.title}</span>
                            <span className="text-[10px] text-gray-400 ml-2">
                              {mod.hours} ชม. {mod.is_practical ? '(ปฏิบัติ)' : '(ทฤษฎี)'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          {mod.description && (
                            <p className="text-xs text-gray-500 mb-3">{mod.description}</p>
                          )}
                          {mod.topics?.length > 0 && (
                            <div className="mb-3">
                              <h6 className="text-[10px] font-bold text-gray-500 uppercase mb-1">หัวข้อย่อย</h6>
                              <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                                {mod.topics.map((t: string, ti: number) => <li key={ti}>{t}</li>)}
                              </ul>
                            </div>
                          )}

                          {/* Competencies */}
                          {(mod.competencies || []).map((comp: any, ci: number) => (
                            <div key={ci} className="mt-3 ml-2 border-l-2 border-indigo-200 pl-3">
                              <p className="text-xs font-medium text-indigo-700 mb-1">
                                🎯 {comp.name}
                                <span className="ml-2 text-[10px] text-gray-400">({comp.competency_type})</span>
                              </p>
                              {comp.description && (
                                <p className="text-[10px] text-gray-500 mb-2">{comp.description}</p>
                              )}
                              {(comp.indicators || []).map((ind: any, ii: number) => (
                                <div key={ii} className="bg-gray-50 rounded-lg p-2.5 mb-2 text-[10px]">
                                  <div className="font-medium text-gray-700 mb-1">
                                    📏 {ind.name} <span className="text-gray-400">(น้ำหนัก {ind.weight}%)</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                                    <div className="bg-green-50 p-1.5 rounded">
                                      <span className="font-bold text-green-700">4 ดีเยี่ยม:</span>{' '}
                                      <span className="text-gray-600">{ind.rubric_excellent}</span>
                                    </div>
                                    <div className="bg-blue-50 p-1.5 rounded">
                                      <span className="font-bold text-blue-700">3 ดี:</span>{' '}
                                      <span className="text-gray-600">{ind.rubric_good}</span>
                                    </div>
                                    <div className="bg-yellow-50 p-1.5 rounded">
                                      <span className="font-bold text-yellow-700">2 พอใช้:</span>{' '}
                                      <span className="text-gray-600">{ind.rubric_fair}</span>
                                    </div>
                                    <div className="bg-red-50 p-1.5 rounded">
                                      <span className="font-bold text-red-700">1 ปรับปรุง:</span>{' '}
                                      <span className="text-gray-600">{ind.rubric_poor}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Evaluation Tab */}
                {previewTab === 'evaluation' && (
                  <div className="space-y-5">
                    {!course.evaluation ? (
                      <p className="text-sm text-gray-400 text-center py-8">ไม่พบเกณฑ์การวัดผลในเอกสาร</p>
                    ) : (
                      <>
                        {/* Passing Criteria */}
                        {course.evaluation.passing_criteria && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 text-sm mb-1">เกณฑ์การผ่าน</h5>
                            <p className="text-sm text-green-700">{course.evaluation.passing_criteria}</p>
                          </div>
                        )}

                        {/* Methods */}
                        {course.evaluation.methods?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-700 text-sm mb-2">วิธีการวัดผล</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {course.evaluation.methods.map((m: any, i: number) => (
                                <div key={i} className="border rounded-lg p-4 flex items-start gap-3">
                                  <span className="text-2xl">{EVAL_METHOD_ICONS[m.method] || '📊'}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-gray-800 text-sm">{m.method}</span>
                                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                        {m.weight_pct}%
                                      </span>
                                    </div>
                                    {m.description && (
                                      <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Total weight bar */}
                            <div className="mt-3 bg-gray-100 rounded-full h-3 overflow-hidden flex">
                              {course.evaluation.methods.map((m: any, i: number) => {
                                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500', 'bg-indigo-500'];
                                return (
                                  <div
                                    key={i}
                                    className={`${colors[i % colors.length]} h-full`}
                                    style={{ width: `${m.weight_pct}%` }}
                                    title={`${m.method}: ${m.weight_pct}%`}
                                  />
                                );
                              })}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {course.evaluation.methods.map((m: any, i: number) => {
                                const colors = ['text-blue-600', 'text-purple-600', 'text-orange-600', 'text-green-600', 'text-red-600', 'text-indigo-600'];
                                return (
                                  <span key={i} className={`text-[10px] ${colors[i % colors.length]}`}>
                                    ■ {m.method} {m.weight_pct}%
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Grading Scale */}
                        {course.evaluation.grading_scale?.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-700 text-sm mb-2">เกณฑ์การให้คะแนน</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {course.evaluation.grading_scale.map((g: any, i: number) => {
                                const gradeColors = [
                                  'bg-green-50 border-green-200 text-green-800',
                                  'bg-blue-50 border-blue-200 text-blue-800',
                                  'bg-yellow-50 border-yellow-200 text-yellow-800',
                                  'bg-red-50 border-red-200 text-red-800',
                                ];
                                return (
                                  <div key={i} className={`border rounded-lg p-3 text-center ${gradeColors[i] || gradeColors[3]}`}>
                                    <div className="font-bold text-sm">{g.grade}</div>
                                    <div className="text-xs mt-1">{g.min_score} - {g.max_score} คะแนน</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Certificate */}
                        {course.evaluation.certificate_type && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                              <h5 className="font-medium text-amber-800 text-sm">ใบรับรอง</h5>
                              <p className="text-xs text-amber-700">{course.evaluation.certificate_type}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t px-5 py-4 flex gap-3">
                <button
                  onClick={handleSaveParsed}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  ✅ บันทึกหลักสูตรลง DB
                </button>
                <button
                  onClick={() => setParsedCourse(null)}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit/Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 rounded-t-2xl text-white">
              <h3 className="font-bold text-lg">
                {editingCourse ? `แก้ไขหลักสูตร: ${editingCourse.title_th}` : 'เพิ่มหลักสูตรใหม่'}
              </h3>
              <p className="text-indigo-200 text-xs mt-1">
                {editingCourse ? 'แก้ไขข้อมูลหลักสูตรและจัดการรุ่นการอบรม' : 'กรอกข้อมูลหลักสูตรใหม่'}
              </p>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักสูตร (ไทย) *</label>
                  <input
                    value={formData.title_th}
                    onChange={e => setFormData({ ...formData, title_th: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="เช่น หลักสูตรช่างติดตั้งระบบโซลาร์เซลล์ ระดับ 2"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักสูตร (อังกฤษ)</label>
                  <input
                    value={formData.title_en}
                    onChange={e => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Solar PV Installation Level 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสหลักสูตร</label>
                  <input
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="SOLAR-PV-L2 (ว่างได้ = auto)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ระดับ</label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="beginner">เริ่มต้น</option>
                    <option value="intermediate">กลาง</option>
                    <option value="advanced">สูง</option>
                    <option value="professional">วิชาชีพ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สาขา</label>
                  <select
                    value={formData.skill_domain}
                    onChange={e => setFormData({ ...formData, skill_domain: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="solar_pv">Solar PV</option>
                    <option value="ev_charger">EV Charger</option>
                    <option value="battery">Battery/HESS</option>
                    <option value="energy_audit">Energy Audit</option>
                    <option value="microgrid">Microgrid</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    วิทยากร (นักวิจัยในหน่วย — สูงสุด 5 ท่าน)
                  </label>
                  {/* Selected instructors */}
                  {selectedInstructors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedInstructors.map((rid) => {
                        const r = researchers.find(r => r.id === rid);
                        const name = r ? `${r.title_th || ''}${r.first_name_th} ${r.last_name_th}` : rid;
                        return (
                          <span key={rid} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                            {name}
                            <button
                              onClick={() => setSelectedInstructors(selectedInstructors.filter(id => id !== rid))}
                              className="text-indigo-400 hover:text-red-500 font-bold"
                            >
                              x
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {/* Dropdown to add */}
                  {selectedInstructors.length < 5 && (
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value && !selectedInstructors.includes(e.target.value)) {
                          setSelectedInstructors([...selectedInstructors, e.target.value]);
                        }
                      }}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">-- เลือกนักวิจัย เพิ่มวิทยากร --</option>
                      {researchers
                        .filter(r => !selectedInstructors.includes(r.id))
                        .map(r => (
                          <option key={r.id} value={r.id}>
                            {r.title_th || ''}{r.first_name_th} {r.last_name_th}
                            {r.position ? ` (${r.position})` : ''}
                          </option>
                        ))
                      }
                    </select>
                  )}
                  {selectedInstructors.length >= 5 && (
                    <p className="text-xs text-amber-600 mt-1">เพิ่มวิทยากรครบ 5 ท่านแล้ว</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">วิทยากรภายนอก (ถ้ามี)</label>
                  <input
                    value={formData.instructor_name}
                    onChange={e => setFormData({ ...formData, instructor_name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="ชื่อวิทยากรภายนอก เช่น ดร.สมชาย จาก กฟภ."
                  />
                </div>
              </div>

              {/* Duration & Fee */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนชั่วโมง</label>
                  <input
                    type="number" min={0}
                    value={formData.duration_hours}
                    onChange={e => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนวัน</label>
                  <input
                    type="number" min={0}
                    value={formData.duration_days}
                    onChange={e => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ค่าลงทะเบียน (บุคคลทั่วไป)</label>
                  <input
                    type="number" min={0}
                    value={formData.fee_external}
                    onChange={e => setFormData({ ...formData, fee_external: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ค่าลงทะเบียน (นักศึกษา)</label>
                  <input
                    type="number" min={0}
                    value={formData.fee_student}
                    onChange={e => setFormData({ ...formData, fee_student: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายหลักสูตร</label>
                <textarea
                  value={formData.description_th}
                  onChange={e => setFormData({ ...formData, description_th: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="รายละเอียดหลักสูตร..."
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">เปิดใช้งานหลักสูตร</span>
              </label>

              {/* Modules (read-only for existing) */}
              {editingCourse && (
                <div>
                  <h4 className="font-medium text-gray-700 text-sm mb-2">
                    โมดูล ({formModules.length})
                    {loadingDetail && <span className="text-gray-400 ml-2">กำลังโหลด...</span>}
                  </h4>
                  {formModules.length > 0 ? (
                    <div className="space-y-2">
                      {formModules.map((mod, i) => (
                        <div key={mod.id} className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center gap-3">
                          <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            M{mod.module_number}
                          </span>
                          <span className="text-sm text-gray-800 flex-1">{mod.title}</span>
                          <span className="text-[10px] text-gray-400">{mod.hours} ชม.</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${mod.is_practical ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {mod.is_practical ? 'ปฏิบัติ' : 'ทฤษฎี'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : !loadingDetail ? (
                    <p className="text-xs text-gray-400">ยังไม่มีโมดูล — ใช้ AI นำเข้าเอกสารเพื่อสร้างโมดูลอัตโนมัติ</p>
                  ) : null}
                </div>
              )}

              {/* Sessions (manage for existing) */}
              {editingCourse && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700 text-sm">
                      รุ่นการอบรม ({formSessions.length})
                    </h4>
                    <button
                      onClick={handleAddSession}
                      className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200 font-medium"
                    >
                      + เพิ่มรุ่น
                    </button>
                  </div>
                  {formSessions.length > 0 ? (
                    <div className="space-y-2">
                      {formSessions.map((sess) => (
                        <div key={sess.id} className="bg-gray-50 rounded-lg px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-indigo-600 font-bold">{sess.session_code}</span>
                              <span className="text-xs text-gray-500">รุ่นที่ {sess.batch_number}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={sess.status}
                                onChange={e => handleUpdateSession(sess.id, { status: e.target.value })}
                                className="border rounded-lg px-2 py-1 text-xs"
                              >
                                <option value="planned">วางแผน</option>
                                <option value="open">เปิดรับสมัคร</option>
                                <option value="closed">ปิดรับสมัคร</option>
                                <option value="in_progress">กำลังอบรม</option>
                                <option value="completed">เสร็จสิ้น</option>
                                <option value="cancelled">ยกเลิก</option>
                              </select>
                              <button
                                onClick={() => handleDeleteSession(sess.id)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                ลบ
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-400">วันเริ่ม</label>
                              <input
                                type="date"
                                value={sess.start_date || ''}
                                onChange={e => handleUpdateSession(sess.id, { start_date: e.target.value || null })}
                                className="w-full border rounded px-2 py-1 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400">วันสิ้นสุด</label>
                              <input
                                type="date"
                                value={sess.end_date || ''}
                                onChange={e => handleUpdateSession(sess.id, { end_date: e.target.value || null })}
                                className="w-full border rounded px-2 py-1 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400">สถานที่</label>
                              <input
                                value={sess.location || ''}
                                onChange={e => handleUpdateSession(sess.id, { location: e.target.value || null })}
                                className="w-full border rounded px-2 py-1 text-xs"
                                placeholder="สถานที่อบรม"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400">จำนวนรับ</label>
                              <input
                                type="number" min={1}
                                value={sess.max_participants || 30}
                                onChange={e => handleUpdateSession(sess.id, { max_participants: Number(e.target.value) })}
                                className="w-full border rounded px-2 py-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">ยังไม่มีรุ่น — กดเพิ่มรุ่นเพื่อเปิดการอบรม</p>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="border-t px-6 py-4 flex gap-3">
              <button
                onClick={handleSaveForm}
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {saving ? 'กำลังบันทึก...' : editingCourse ? 'บันทึกการแก้ไข' : 'เพิ่มหลักสูตร'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingCourse(null); }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-3xl font-bold text-purple-600">{courses.length}</div>
          <div className="text-sm text-gray-500">หลักสูตรทั้งหมด</div>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-3xl font-bold text-green-600">{courses.filter(c => c.is_active).length}</div>
          <div className="text-sm text-gray-500">เปิดใช้งาน</div>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-3xl font-bold text-blue-600">{sessions.length}</div>
          <div className="text-sm text-gray-500">รุ่นทั้งหมด</div>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-3xl font-bold text-amber-600">
            {sessions.filter(s => s.status === 'open').length}
          </div>
          <div className="text-sm text-gray-500">เปิดรับสมัคร</div>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-700">หลักสูตรในระบบ</h3>
          <button
            onClick={handleAdd}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
          >
            + เพิ่มหลักสูตร
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">กำลังโหลด...</div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-lg mb-2">ยังไม่มีหลักสูตร</p>
            <p className="text-sm mb-4">นำเข้าเอกสารหลักสูตรด้วย AI หรือรัน <code className="bg-gray-100 px-2 py-1 rounded">025_training_platform.sql</code></p>
            <button
              onClick={() => setShowImporter(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
            >
              📄 นำเข้าเอกสารหลักสูตร (AI)
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {courses.map((c) => {
              const level = LEVEL_MAP[c.level] || LEVEL_MAP.beginner;
              const courseSessions = sessions.filter(s => s.course_id === c.id);

              return (
                <div key={c.id} className="px-5 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-indigo-600 font-bold">{c.code}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${level.color}`}>
                          {level.label}
                        </span>
                        {!c.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">ปิดใช้งาน</span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-800">{c.title_th}</h4>
                      {c.title_en && <p className="text-xs text-gray-400">{c.title_en}</p>}
                      <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-gray-500">
                        {c.duration_days && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{c.duration_days} วัน ({c.duration_hours} ชม.)</span>}
                        {c.fee_external > 0 && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">{Number(c.fee_external).toLocaleString()} บาท</span>}
                        <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{courseSessions.length} รุ่น</span>
                        {/* Show instructors */}
                        {Array.isArray(c.instructor_ids) && c.instructor_ids.length > 0 && (
                          c.instructor_ids.map((rid: string) => {
                            const r = researchers.find(r => r.id === rid);
                            return r ? (
                              <span key={rid} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                                {r.title_th || ''}{r.first_name_th} {r.last_name_th?.charAt(0)}.
                              </span>
                            ) : null;
                          })
                        )}
                        {c.instructor_name && (
                          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded">{c.instructor_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 ml-4">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleToggleActive(c.id, c.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                          c.is_active
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {c.is_active ? 'ปิด' : 'เปิด'}
                      </button>
                      <Link
                        href={`/services/training/${c.code}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium"
                      >
                        ดู
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.title_th)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
