'use client';

import { useState, useEffect } from 'react';

interface AIConfigItem {
  id: string;
  provider: string;
  model_name: string;
  display_name: string;
  api_key_masked: string;
  has_api_key: boolean;
  api_endpoint: string;
  is_active: boolean;
  is_default: boolean;
  capabilities: string[];
  models: string[];
  updated_at: string;
}

const PROVIDER_INFO: Record<string, {
  icon: string; color: string; keyPlaceholder: string; keyLabel: string; helpUrl: string;
  pricing?: string; latestModels: string[];
}> = {
  claude: {
    icon: '🟣',
    color: 'purple',
    keyPlaceholder: 'sk-ant-api03-xxxx...',
    keyLabel: 'Anthropic API Key',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    pricing: '$3/$15 per M tokens (Sonnet) · Pay-per-use',
    latestModels: [
      'claude-sonnet-4-7-20251015',
      'claude-sonnet-4-6-20250812',
      'claude-sonnet-4-5-20250929',
      'claude-opus-4-1-20250805',
      'claude-haiku-4-5-20251029',
    ],
  },
  gemini: {
    icon: '🔵',
    color: 'blue',
    keyPlaceholder: 'AIzaSyxxxx...',
    keyLabel: 'Google AI API Key',
    helpUrl: 'https://aistudio.google.com/app/apikey',
    pricing: '✨ ฟรี (15 RPM, 1M TPM) · Paid: $0.075/$0.30 per M',
    latestModels: [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro',
    ],
  },
  openai: {
    icon: '🟢',
    color: 'green',
    keyPlaceholder: 'sk-proj-xxxx...',
    keyLabel: 'OpenAI API Key',
    helpUrl: 'https://platform.openai.com/api-keys',
    pricing: 'GPT-4.1: $2/$8 · GPT-5: $5/$20 · Pay-per-use',
    latestModels: [
      'gpt-5',
      'gpt-5-mini',
      'gpt-4.5',
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4o',
      'o3',
      'o4-mini',
    ],
  },
  openrouter: {
    icon: '🌐',
    color: 'orange',
    keyPlaceholder: 'sk-or-v1-xxxx...',
    keyLabel: 'OpenRouter API Key',
    helpUrl: 'https://openrouter.ai/keys',
    pricing: '🌟 1 key ใช้ได้ทุกโมเดล + ฟรีหลายตัว · Pay-per-use',
    latestModels: [
      // ฟรี
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'deepseek/deepseek-r1:free',
      'deepseek/deepseek-chat-v3-0324:free',
      'nvidia/llama-3.1-nemotron-70b-instruct:free',
      'qwen/qwen-2.5-72b-instruct:free',
      // Premium
      'anthropic/claude-sonnet-4.5',
      'openai/gpt-4.1',
      'google/gemini-2.5-pro',
      'deepseek/deepseek-v3',
    ],
  },
  local: {
    icon: '🖥️',
    color: 'gray',
    keyPlaceholder: '',
    keyLabel: 'ไม่ต้องใช้ API Key',
    helpUrl: 'https://ollama.com/download',
    pricing: '✨ ฟรี 100% (รันบนเครื่องตัวเอง)',
    latestModels: [
      'llama3.3:70b',
      'llama3.1:8b',
      'qwen2.5:14b',
      'qwen2.5-coder:14b',
      'deepseek-r1:32b',
      'deepseek-v3:67b',
      'gemma2:9b',
      'mistral:7b',
    ],
  },
};

export default function AISettingsPage() {
  const [configs, setConfigs] = useState<AIConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; message: string; latency?: number }>>({});

  // Editing state per provider
  const [editKeys, setEditKeys] = useState<Record<string, string>>({});
  const [editModels, setEditModels] = useState<Record<string, string>>({});
  const [editEndpoints, setEditEndpoints] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Show legacy providers (Claude/Gemini/OpenAI/Local direct)
  const [showLegacy, setShowLegacy] = useState(false);

  // OpenRouter models browser
  const [showOrModels, setShowOrModels] = useState(false);
  const [orModels, setOrModels] = useState<{ free: any[]; paid: any[]; total: number; free_count: number; paid_count: number } | null>(null);
  const [orLoading, setOrLoading] = useState(false);
  const [orFilter, setOrFilter] = useState<'all' | 'free' | 'paid'>('free');
  const [orSearch, setOrSearch] = useState('');
  const [orSelected, setOrSelected] = useState<Set<string>>(new Set());

  const fetchOpenRouterModels = async () => {
    setOrLoading(true);
    try {
      const res = await fetch('/api/admin/openrouter-models');
      if (res.ok) {
        const data = await res.json();
        setOrModels(data);
      }
    } catch (err) {
      console.error(err);
    }
    setOrLoading(false);
  };

  const handleOpenOrModels = async () => {
    setShowOrModels(true);
    if (!orModels) await fetchOpenRouterModels();
  };

  const handleSaveOrModels = async () => {
    if (orSelected.size === 0) return;
    try {
      const res = await fetch('/api/admin/openrouter-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: Array.from(orSelected), replace: true }),
      });
      if (res.ok) {
        setShowOrModels(false);
        setOrSelected(new Set());
        fetchConfigs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleOrModel = (id: string) => {
    setOrSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ──────────────────────────────────────────
  // Export / Import / Browser cache
  // ──────────────────────────────────────────
  const CACHE_KEY = 'cesru_ai_config_cache_v1';
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    file: string;
    parsed: any;
    diff: Array<{ provider: string; status: 'new' | 'update' | 'unchanged'; willOverwriteKey: boolean }>;
  } | null>(null);
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);

  // Load cache before network
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.configs && cached?.timestamp) {
          setConfigs(cached.configs);
          setCacheTimestamp(cached.timestamp);
          // Build edit state from cache
          const models: Record<string, string> = {};
          const endpoints: Record<string, string> = {};
          cached.configs.forEach((c: AIConfigItem) => {
            models[c.provider] = c.model_name;
            endpoints[c.provider] = c.api_endpoint || '';
          });
          setEditModels(models);
          setEditEndpoints(endpoints);
          setLoading(false); // show cached immediately
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Update cache whenever configs change (without api_key — server-only)
  useEffect(() => {
    if (typeof window === 'undefined' || configs.length === 0) return;
    const cleaned = configs.map((c) => ({ ...c, api_key: '' }));
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ configs: cleaned, timestamp: Date.now() }),
    );
    setCacheTimestamp(Date.now());
  }, [configs]);

  const handleExport = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      exported_from: window.location.host,
      version: 1,
      configs: configs.map((c) => ({
        provider: c.provider,
        display_name: c.display_name,
        model_name: c.model_name,
        api_endpoint: c.api_endpoint,
        is_active: c.is_active,
        is_default: c.is_default,
        capabilities: c.capabilities,
        models: c.models,
        api_key_masked: c.api_key_masked || '', // never includes real key
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cesru-ai-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed?.configs || !Array.isArray(parsed.configs)) {
        alert('ไฟล์ไม่ถูกต้อง — ต้องมี field "configs" เป็น array');
        return;
      }
      const diff = parsed.configs.map((incoming: any) => {
        const existing = configs.find((c) => c.provider === incoming.provider);
        if (!existing) return { provider: incoming.provider, status: 'new' as const, willOverwriteKey: false };
        const samesame =
          existing.model_name === incoming.model_name &&
          existing.is_active === incoming.is_active &&
          existing.is_default === incoming.is_default &&
          existing.api_endpoint === incoming.api_endpoint;
        return {
          provider: incoming.provider,
          status: samesame ? ('unchanged' as const) : ('update' as const),
          willOverwriteKey: false, // export never includes real keys
        };
      });
      setImportPreview({ file: file.name, parsed, diff });
    } catch (e: any) {
      alert('Parse JSON ไม่สำเร็จ: ' + (e?.message || ''));
    }
  };

  const handleImportConfirm = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
      for (const incoming of importPreview.parsed.configs) {
        await fetch('/api/admin/ai-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: incoming.provider,
            model_name: incoming.model_name,
            api_endpoint: incoming.api_endpoint,
            is_active: incoming.is_active,
            is_default: incoming.is_default,
            capabilities: incoming.capabilities,
            models: incoming.models,
            // never overwrite api_key from import (it's masked)
          }),
        });
      }
      setImportPreview(null);
      await fetchConfigs();
      alert('นำเข้าสำเร็จ — โปรดใส่ API key ใหม่ทุก provider ที่ active');
    } catch (e: any) {
      alert('นำเข้าไม่สำเร็จ: ' + (e?.message || ''));
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/admin/ai-config');
      const data = await res.json();
      setConfigs(data.configs || []);

      // Pre-fill edit states
      const models: Record<string, string> = {};
      const endpoints: Record<string, string> = {};
      (data.configs || []).forEach((c: AIConfigItem) => {
        models[c.provider] = c.model_name;
        endpoints[c.provider] = c.api_endpoint || '';
      });
      setEditModels(models);
      setEditEndpoints(endpoints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (provider: string) => {
    setSaving(provider);
    try {
      const body: Record<string, any> = { provider };

      // ส่ง API key เฉพาะเมื่อกรอกใหม่
      if (editKeys[provider]) {
        body.api_key = editKeys[provider];
      }
      if (editModels[provider]) {
        body.model_name = editModels[provider];
        // ถ้า model ที่พิมพ์ไม่อยู่ใน list → เพิ่มเข้าไป
        const currentConfig = configs.find(c => c.provider === provider);
        const currentModels = currentConfig?.models || [];
        if (!currentModels.includes(editModels[provider])) {
          body.models = [...currentModels, editModels[provider]];
        }
      }
      if (editEndpoints[provider] !== undefined) {
        body.api_endpoint = editEndpoints[provider];
      }

      // ถ้ากรอก key → active
      if (editKeys[provider] || provider === 'local') {
        body.is_active = true;
      }

      // ผู้ใช้กด "บันทึก" = เจตนาว่าจะใช้ provider/model นี้ต่อไป
      // → ตั้งเป็น active + default อัตโนมัติ (clear default อื่น server-side)
      body.is_active = true;
      body.is_default = true;

      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Clear key input after save
        setEditKeys(prev => ({ ...prev, [provider]: '' }));
        fetchConfigs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleSetDefault = async (provider: string) => {
    setSaving(provider);
    try {
      await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, is_default: true, is_active: true }),
      });
      fetchConfigs();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const handleToggleActive = async (provider: string, is_active: boolean) => {
    try {
      await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, is_active }),
      });
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteKey = async (provider: string) => {
    if (!confirm(`ต้องการลบ API Key ของ ${provider} ออกหรือไม่?`)) return;
    try {
      await fetch(`/api/admin/ai-config?provider=${provider}`, { method: 'DELETE' });
      fetchConfigs();
      setTestResult(prev => { const n = { ...prev }; delete n[provider]; return n; });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTest = async (provider: string) => {
    setTesting(provider);
    setTestResult(prev => ({ ...prev, [provider]: { success: false, message: 'กำลังทดสอบ...' } }));
    try {
      const res = await fetch('/api/admin/ai-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const result = await res.json();
      setTestResult(prev => ({ ...prev, [provider]: result }));
    } catch (err: any) {
      setTestResult(prev => ({ ...prev, [provider]: { success: false, message: err.message } }));
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        กำลังโหลดการตั้งค่า AI...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">ตั้งค่า AI Provider</h1>
          <p className="text-gray-500 text-sm mt-1">
            กรอก API Key เพื่อเปิดใช้งาน AI แยกเอกสาร / สร้างหลักสูตร / ประเมินผลอัตโนมัติ
          </p>
          {cacheTimestamp && (
            <p className="text-[10px] text-gray-400 mt-1">
              💾 cache: {new Date(cacheTimestamp).toLocaleString('th-TH')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={configs.length === 0}
            className="px-3 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-xs font-medium disabled:opacity-50"
            title="Export config เป็น JSON (ไม่รวม API key)"
          >
            📥 Export
          </button>
          <label className="px-3 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 text-xs font-medium cursor-pointer">
            📤 Import
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFile(f);
                e.currentTarget.value = '';
              }}
            />
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-4 mb-8">
        <h3 className="font-medium text-orange-900 text-sm mb-2 flex items-center gap-2">
          <span>🌐</span>
          <span>ระบบใช้ OpenRouter เป็น Gateway ไปยัง AI ทุกตัว</span>
        </h3>
        <ul className="text-xs text-orange-800 space-y-1">
          <li>✨ <strong>1 API Key</strong> ใช้ได้ทั้ง Claude, GPT, Gemini, Llama, DeepSeek, Qwen, Mistral ฯลฯ</li>
          <li>🆓 มีรุ่น <strong>ฟรี</strong> ให้ใช้ + รุ่นเสียเงินราคาถูก (เริ่มต้น $0.10 per M tokens)</li>
          <li>🔄 Auto-fallback หาก provider หลักล่ม</li>
          <li>🎯 เลือก model ได้ผ่านปุ่ม &quot;🔄 ดู Models ทั้งหมด&quot;</li>
        </ul>
      </div>

      {/* Provider Cards — แสดงเฉพาะ OpenRouter (ใช้เป็น gateway สำหรับ AI ทุกตัว) */}
      <div className="space-y-6">
        {configs.filter((c) => showLegacy || c.provider === 'openrouter').map((config) => {
          const info = PROVIDER_INFO[config.provider] || PROVIDER_INFO.local;
          const isEditing = !!editKeys[config.provider];
          const result = testResult[config.provider];

          return (
            <div
              key={config.provider}
              className={`bg-white rounded-xl border-2 overflow-hidden transition ${
                config.is_default
                  ? 'border-indigo-400 shadow-md'
                  : config.is_active
                  ? 'border-green-200 shadow-sm'
                  : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 flex items-center justify-between ${
                config.is_default ? 'bg-indigo-50' : config.is_active ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{config.display_name}</h3>
                    <p className="text-[10px] text-gray-400">{config.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.is_default && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      ค่าเริ่มต้น
                    </span>
                  )}
                  {config.has_api_key && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      มี Key
                    </span>
                  )}
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggleActive(config.provider, !config.is_active)}
                    className={`relative w-10 h-5 rounded-full transition ${
                      config.is_active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      config.is_active ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-4">
                {/* API Key */}
                {config.provider !== 'local' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {info.keyLabel}
                      <a href={info.helpUrl} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-500 hover:underline ml-2 text-xs font-normal">
                        สมัครที่นี่ &rarr;
                      </a>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showKey[config.provider] ? 'text' : 'password'}
                          value={editKeys[config.provider] || ''}
                          onChange={(e) => setEditKeys(prev => ({ ...prev, [config.provider]: e.target.value }))}
                          placeholder={config.has_api_key ? `ปัจจุบัน: ${config.api_key_masked}` : info.keyPlaceholder}
                          className="w-full border rounded-lg px-3 py-2 text-sm font-mono pr-16"
                        />
                        <button
                          onClick={() => setShowKey(prev => ({ ...prev, [config.provider]: !prev[config.provider] }))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                          {showKey[config.provider] ? 'ซ่อน' : 'แสดง'}
                        </button>
                      </div>
                      {config.has_api_key && (
                        <button
                          onClick={() => handleDeleteKey(config.provider)}
                          className="text-red-500 hover:text-red-700 text-xs px-2"
                          title="ลบ Key"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ollama Endpoint
                      <a href={info.helpUrl} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-500 hover:underline ml-2 text-xs font-normal">
                        ติดตั้ง Ollama &rarr;
                      </a>
                    </label>
                    <input
                      type="text"
                      value={editEndpoints[config.provider] || ''}
                      onChange={(e) => setEditEndpoints(prev => ({ ...prev, [config.provider]: e.target.value }))}
                      placeholder="http://localhost:11434"
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    />
                  </div>
                )}

                {/* Model Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">โมเดล</label>
                    {info.pricing && (
                      <span className="text-[10px] text-gray-500 italic">{info.pricing}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Active model input */}
                    <input
                      type="text"
                      value={editModels[config.provider] ?? config.model_name}
                      onChange={(e) => setEditModels(prev => ({ ...prev, [config.provider]: e.target.value }))}
                      placeholder="พิมพ์ชื่อ model เช่น claude-sonnet-4-5-20250929"
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* OpenRouter: special button to browse all models */}
                    {config.provider === 'openrouter' && (
                      <button
                        type="button"
                        onClick={handleOpenOrModels}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
                      >
                        <span>🔄</span>
                        <span>ดู Models ทั้งหมดจาก OpenRouter (Live)</span>
                      </button>
                    )}

                    {/* Quick pick: Latest models from PROVIDER_INFO */}
                    {info.latestModels && info.latestModels.length > 0 && (
                      <div>
                        <p className="text-[10px] text-gray-500 mb-1">⚡ Latest models (คลิกเพื่อใช้):</p>
                        <div className="flex flex-wrap gap-1">
                          {info.latestModels.map((m) => {
                            const isActive = (editModels[config.provider] ?? config.model_name) === m;
                            return (
                              <button
                                key={m}
                                onClick={() => setEditModels(prev => ({ ...prev, [config.provider]: m }))}
                                className={`text-[10px] px-2 py-1 rounded-md font-mono transition ${
                                  isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                                }`}
                              >
                                {m}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Saved models from DB (if any extra) */}
                    {config.models && config.models.length > 0 && config.models.some((m) => !info.latestModels?.includes(m)) && (
                      <div>
                        <p className="text-[10px] text-gray-500 mb-1">📦 Saved in DB:</p>
                        <div className="flex flex-wrap gap-1">
                          {config.models.filter((m) => !info.latestModels?.includes(m)).map((m: string) => {
                            const isActive = (editModels[config.provider] ?? config.model_name) === m;
                            return (
                              <button
                                key={m}
                                onClick={() => setEditModels(prev => ({ ...prev, [config.provider]: m }))}
                                className={`text-[10px] px-2 py-1 rounded-md font-mono transition ${
                                  isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                {m}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    💡 พิมพ์ model ใหม่ได้เลย — ระบบจะบันทึกลง DB ตอนกด &quot;บันทึก&quot;
                  </p>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1">
                  {(config.capabilities || []).map((cap: string) => (
                    <span key={cap} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {cap === 'document_parse' ? 'แยกเอกสาร' : cap === 'course_parse' ? 'แยกหลักสูตร' : cap === 'evaluation' ? 'ประเมินผล' : cap === 'grant_parse' ? 'วิเคราะห์ทุนวิจัย' : cap}
                    </span>
                  ))}
                </div>

                {/* Test Result */}
                {result && (
                  <div className={`rounded-lg p-3 text-sm ${
                    result.success
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0">{result.success ? '✅' : '❌'}</span>
                      <span className="break-words whitespace-pre-line">{result.message || (result as any).error || 'ไม่มีรายละเอียดข้อผิดพลาด'}</span>
                    </div>
                    {result.latency && (
                      <p className="text-[10px] mt-1 opacity-60">Latency: {result.latency}ms</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleSave(config.provider)}
                    disabled={saving === config.provider}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {saving === config.provider ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                  <button
                    onClick={() => handleTest(config.provider)}
                    disabled={testing === config.provider}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    {testing === config.provider ? 'กำลังทดสอบ...' : 'ทดสอบเชื่อมต่อ'}
                  </button>
                  {!config.is_default && config.has_api_key && (
                    <button
                      onClick={() => handleSetDefault(config.provider)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-2"
                    >
                      ตั้งเป็นค่าเริ่มต้น
                    </button>
                  )}
                  {config.updated_at && (
                    <span className="text-[10px] text-gray-300 ml-auto">
                      อัพเดท: {new Date(config.updated_at).toLocaleString('th-TH')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle legacy providers */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowLegacy(!showLegacy)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {showLegacy
            ? '🔼 ซ่อน Legacy providers (Claude/Gemini/OpenAI/Local direct)'
            : '⚙️ แสดง Legacy providers (สำหรับใช้ API key ตรงโดยไม่ผ่าน OpenRouter)'}
        </button>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 bg-gray-50 rounded-xl border p-4 text-center">
        <p className="text-sm text-gray-500">
          {showLegacy ? (
            <>เปิดใช้งาน: {configs.filter(c => c.is_active).length}/{configs.length} providers</>
          ) : (
            <>OpenRouter: {configs.find(c => c.provider === 'openrouter')?.is_active ? '🟢 Active' : '🔴 Inactive'}</>
          )}
          {configs.find(c => c.is_default) && (
            <> · ค่าเริ่มต้น: <span className="font-bold text-indigo-600">{configs.find(c => c.is_default)?.display_name}</span></>
          )}
        </p>
      </div>

      {/* OpenRouter Models Modal */}
      {showOrModels && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOrModels(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <span>🌐</span>
                    <span>OpenRouter Models</span>
                  </h2>
                  {orModels && (
                    <p className="text-xs text-white/80 mt-0.5">
                      ทั้งหมด {orModels.total} โมเดล · ฟรี {orModels.free_count} · เสียเงิน {orModels.paid_count}
                    </p>
                  )}
                </div>
                <button onClick={() => setShowOrModels(false)} className="text-white/80 hover:text-white text-2xl">✕</button>
              </div>
            </div>

            {/* Filters */}
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2 flex-wrap flex-shrink-0">
              <button onClick={() => setOrFilter('free')}
                className={`px-3 py-1 rounded-full text-sm ${orFilter === 'free' ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300'}`}>
                ✨ ฟรี ({orModels?.free_count || 0})
              </button>
              <button onClick={() => setOrFilter('paid')}
                className={`px-3 py-1 rounded-full text-sm ${orFilter === 'paid' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}>
                💰 Premium ({orModels?.paid_count || 0})
              </button>
              <button onClick={() => setOrFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${orFilter === 'all' ? 'bg-gray-600 text-white' : 'bg-white border border-gray-300'}`}>
                ทั้งหมด ({orModels?.total || 0})
              </button>
              <input type="text" value={orSearch} onChange={(e) => setOrSearch(e.target.value)}
                placeholder="🔍 ค้นหา model..."
                className="flex-1 px-3 py-1 border rounded-lg text-sm min-w-[200px]" />
              <button onClick={fetchOpenRouterModels}
                disabled={orLoading}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                {orLoading ? '⏳' : '🔄'} Refresh
              </button>
            </div>

            {/* Models list */}
            <div className="flex-1 overflow-y-auto p-3">
              {orLoading ? (
                <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
              ) : !orModels ? (
                <div className="text-center py-12 text-gray-400">ไม่มีข้อมูล</div>
              ) : (
                <div className="space-y-1">
                  {(orFilter === 'free' ? orModels.free :
                    orFilter === 'paid' ? orModels.paid :
                    [...orModels.free, ...orModels.paid])
                    .filter((m) => !orSearch || m.id.toLowerCase().includes(orSearch.toLowerCase()) || m.name?.toLowerCase().includes(orSearch.toLowerCase()))
                    .map((m) => {
                      const selected = orSelected.has(m.id);
                      return (
                        <label key={m.id}
                          className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition ${
                            selected ? 'bg-indigo-50 border border-indigo-300' : 'hover:bg-gray-50 border border-transparent'
                          }`}>
                          <input type="checkbox" checked={selected}
                            onChange={() => toggleOrModel(m.id)}
                            className="mt-1" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-semibold">{m.id}</span>
                              {m.is_free && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">FREE</span>
                              )}
                              {m.has_vision && (
                                <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">📷 Vision</span>
                              )}
                              {!m.is_free && (
                                <span className="text-[10px] text-gray-500">{m.price}</span>
                              )}
                            </div>
                            {m.name && m.name !== m.id && (
                              <p className="text-xs text-gray-500 mt-0.5">{m.name}</p>
                            )}
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              Provider: <strong>{m.provider}</strong>
                              {m.context_length > 0 && <> · Context: {(m.context_length / 1000).toFixed(0)}k tokens</>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditModels(prev => ({ ...prev, openrouter: m.id }));
                              setShowOrModels(false);
                            }}
                            className="text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 flex-shrink-0"
                          >
                            ใช้ตอนนี้
                          </button>
                        </label>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0">
              <p className="text-xs text-gray-500">
                เลือกแล้ว: <span className="font-bold text-indigo-600">{orSelected.size}</span> โมเดล
                {' '}<span className="text-gray-400">(จะถูกบันทึกไว้ใน DB เพื่อใช้ใน dropdown)</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setOrSelected(new Set())}
                  className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50">
                  Clear
                </button>
                <button onClick={handleSaveOrModels}
                  disabled={orSelected.size === 0}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">
                  💾 บันทึก {orSelected.size > 0 && `(${orSelected.size})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">📤 ตรวจสอบก่อนนำเข้า</h2>
                <p className="text-xs text-emerald-100 mt-0.5">{importPreview.file}</p>
              </div>
              <button onClick={() => setImportPreview(null)} className="text-white/80 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <p className="text-xs text-gray-500 mb-3">
                {importPreview.parsed.exported_at && (
                  <>Exported: {new Date(importPreview.parsed.exported_at).toLocaleString('th-TH')}<br /></>
                )}
                {importPreview.parsed.exported_from && (
                  <>จาก: {importPreview.parsed.exported_from}</>
                )}
              </p>

              <div className="space-y-2">
                {importPreview.diff.map((row) => {
                  const colors = {
                    new: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                    update: 'bg-amber-50 border-amber-200 text-amber-700',
                    unchanged: 'bg-gray-50 border-gray-200 text-gray-500',
                  };
                  const labels = { new: '🆕 ใหม่', update: '✏️ แก้ไข', unchanged: '✓ ไม่เปลี่ยน' };
                  return (
                    <div key={row.provider} className={`border rounded-lg px-3 py-2 text-sm ${colors[row.status]}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold">{row.provider}</span>
                        <span className="text-xs">{labels[row.status]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
                ℹ️ การนำเข้า <strong>ไม่ overwrite API key</strong> ของ provider ที่มีอยู่ — คุณต้องใส่ key เองหลังจาก import
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t flex gap-2 justify-end">
              <button
                onClick={() => setImportPreview(null)}
                className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleImportConfirm}
                disabled={importing}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
              >
                {importing ? 'กำลังนำเข้า...' : '✅ ยืนยันนำเข้า'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
