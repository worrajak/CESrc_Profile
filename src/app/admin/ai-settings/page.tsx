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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ตั้งค่า AI Provider</h1>
        <p className="text-gray-500 text-sm mt-1">
          กรอก API Key เพื่อเปิดใช้งาน AI แยกเอกสาร / สร้างหลักสูตร / ประเมินผลอัตโนมัติ
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <h3 className="font-medium text-amber-800 text-sm mb-1">คำแนะนำ</h3>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>- ต้องเปิดใช้อย่างน้อย 1 provider เพื่อให้ระบบ AI ทำงาน</li>
          <li>- Provider ที่ตั้งเป็น &quot;ค่าเริ่มต้น&quot; จะถูกใช้เมื่อผู้ใช้ไม่ได้เลือก</li>
          <li>- API Key ถูกเก็บในฐานข้อมูล (แนะนำใช้ RLS ป้องกันการเข้าถึง)</li>
          <li>- Local AI (Ollama) ไม่ต้องใช้ API Key แต่ต้องรัน Ollama บนเครื่อง</li>
        </ul>
      </div>

      {/* Provider Cards */}
      <div className="space-y-6">
        {configs.map((config) => {
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
                      <span>{result.success ? '✅' : '❌'}</span>
                      <span className="break-all">{result.message || (result as any).error || 'ไม่มีรายละเอียดข้อผิดพลาด'}</span>
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

      {/* Summary Footer */}
      <div className="mt-8 bg-gray-50 rounded-xl border p-4 text-center">
        <p className="text-sm text-gray-500">
          เปิดใช้งาน: {configs.filter(c => c.is_active).length}/{configs.length} providers
          {configs.find(c => c.is_default) && (
            <> · ค่าเริ่มต้น: <span className="font-bold text-indigo-600">{configs.find(c => c.is_default)?.display_name}</span></>
          )}
        </p>
      </div>
    </div>
  );
}
