'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AiModelConfig, AiProvider, AiTaskType, api, ApiError } from '@/lib/api';

const TASK_TYPES: AiTaskType[] = ['panel_detection', 'narration'];
const TASK_LABEL: Record<AiTaskType, string> = {
  panel_detection: 'Tách panel (vision)',
  narration: 'Sinh nội dung recap',
};
const PROVIDERS: AiProvider[] = ['openrouter', 'gemini', 'anthropic'];

export default function AdminAiModelsPage() {
  const [configs, setConfigs] = useState<AiModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState<AiProvider>('openrouter');
  const [modelId, setModelId] = useState('');
  const [taskType, setTaskType] = useState<AiTaskType>('panel_detection');
  const [apiKey, setApiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAiModelConfigs();
      setConfigs(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải danh sách model');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.createAiModelConfig({ label, provider, modelId, taskType, apiKey });
      setLabel('');
      setModelId('');
      setApiKey('');
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Không thể tạo model config');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(id: string) {
    await api.activateAiModelConfig(id);
    await load();
  }

  async function handleDelete(id: string) {
    await api.deleteAiModelConfig(id);
    await load();
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/projects" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
          ← Quay lại
        </Link>

        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Quản lý AI model</h1>

        <form onSubmit={handleCreate} className="mb-8 space-y-3 rounded-lg bg-white p-4 shadow">
          <h2 className="text-sm font-medium text-gray-900">Thêm model mới</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nhãn (vd: Gemini Flash)"
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProvider)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <input
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="Model id (vd: google/gemini-2.5-flash)"
              required
              className="col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as AiTaskType)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TASK_LABEL[t]}
                </option>
              ))}
            </select>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API key"
              type="password"
              required
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Đang tạo...' : 'Tạo model config'}
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          TASK_TYPES.map((task) => (
            <div key={task} className="mb-6">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">{TASK_LABEL[task]}</h2>
              <div className="space-y-2">
                {configs
                  .filter((c) => c.taskType === task)
                  .map((config) => (
                    <div
                      key={config._id}
                      className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm ring-1 ring-gray-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {config.label}{' '}
                          {config.isActive && (
                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              Đang dùng
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          {config.provider} / {config.modelId} / key {config.apiKeyMasked}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!config.isActive && (
                          <button
                            type="button"
                            onClick={() => handleActivate(config._id)}
                            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                          >
                            Kích hoạt
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(config._id)}
                          className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                {configs.filter((c) => c.taskType === task).length === 0 && (
                  <p className="text-xs text-gray-400">Chưa có model nào.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
