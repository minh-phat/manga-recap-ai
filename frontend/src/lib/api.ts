const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(message || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

async function uploadRequest<T>(path: string, formData: FormData): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Project {
  _id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export type PageStatus = 'uploaded' | 'segmenting' | 'segmented' | 'failed';

export interface Page {
  _id: string;
  projectId: string;
  pageIndex: number;
  imageUrl: string;
  width: number;
  height: number;
  panelCount: number;
  status: PageStatus;
  createdAt: string;
}

export type AiProvider = 'openrouter' | 'gemini' | 'anthropic' | 'local';
export type AiTaskType = 'panel_detection' | 'narration';

export interface AiModelConfig {
  _id: string;
  label: string;
  provider: AiProvider;
  modelId: string;
  taskType: AiTaskType;
  apiKeyMasked: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RecapJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface RecapJob {
  _id: string;
  projectId: string;
  pageIds: string[];
  language: string;
  status: RecapJobStatus;
  currentStep?: string;
  error?: string;
  scriptId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PanelBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PanelStatus = 'ok' | 'failed';

export interface PanelAttempt {
  bbox: PanelBoundingBox;
  croppedImageUrl: string;
}

export interface PanelRecord {
  _id: string;
  pageId: string;
  order: number;
  bbox: PanelBoundingBox;
  croppedImageUrl: string;
  status: PanelStatus;
  attempts: PanelAttempt[];
}

export interface RecapScriptEntry {
  panelId: string;
  pageId: string;
  order: number;
  croppedImageUrl: string;
  narrationText: string;
  bbox: PanelBoundingBox;
}

export interface RecapScript {
  _id: string;
  projectId: string;
  jobId: string;
  entries: RecapScriptEntry[];
  createdAt: string;
}

export type RecapVideoJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface RecapLanguage {
  code: string;
  label: string;
}

export const RECAP_LANGUAGES: RecapLanguage[] = [
  { code: 'vi-VN', label: 'Tiếng Việt' },
  { code: 'en-US', label: 'English' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'zh-CN', label: '中文' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'es-ES', label: 'Español' },
];

export interface RecapVideoJob {
  _id: string;
  projectId: string;
  scriptId: string;
  includeCaptions: boolean;
  language: string;
  pitch?: number;
  rate?: number;
  status: RecapVideoJobStatus;
  currentStep?: string;
  error?: string;
  videoUrl?: string;
  durationInFrames?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export const api = {
  register: (data: { email: string; password: string; name: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getProjects: () => request<Project[]>('/projects'),

  createProject: (name: string) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify({ name }) }),

  getProject: (id: string) => request<Project>(`/projects/${id}`),

  getProjectPages: (projectId: string) => request<Page[]>(`/projects/${projectId}/pages`),

  getPagePanels: (projectId: string, pageId: string) =>
    request<PanelRecord[]>(`/projects/${projectId}/pages/${pageId}/panels`),

  uploadPages: (projectId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return uploadRequest<Page[]>(`/projects/${projectId}/pages`, formData);
  },

  deletePage: (projectId: string, pageId: string) =>
    request<void>(`/projects/${projectId}/pages/${pageId}`, { method: 'DELETE' }),

  reorderPages: (projectId: string, pageIds: string[]) =>
    request<Page[]>(`/projects/${projectId}/pages/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ pageIds }),
    }),

  createRecapJob: (projectId: string, pageIds: string[], language: string) =>
    request<RecapJob>(`/projects/${projectId}/recap-jobs`, {
      method: 'POST',
      body: JSON.stringify({ pageIds, language }),
    }),

  getRecapJob: (projectId: string, jobId: string) =>
    request<RecapJob>(`/projects/${projectId}/recap-jobs/${jobId}`),

  listRecapJobs: (projectId: string) =>
    request<RecapJob[]>(`/projects/${projectId}/recap-jobs`),

  getRecapScript: (projectId: string, scriptId: string) =>
    request<RecapScript>(`/projects/${projectId}/recap-scripts/${scriptId}`),

  createRecapVideoJob: (
    projectId: string,
    scriptId: string,
    includeCaptions: boolean,
    language: string,
    pitch?: number,
    rate?: number,
  ) =>
    request<RecapVideoJob>(`/projects/${projectId}/recap-scripts/${scriptId}/video-jobs`, {
      method: 'POST',
      body: JSON.stringify({ includeCaptions, language, pitch, rate }),
    }),

  getRecapVideoJob: (projectId: string, videoJobId: string) =>
    request<RecapVideoJob>(`/projects/${projectId}/video-jobs/${videoJobId}`),

  listRecapVideoJobs: (projectId: string, scriptId: string) =>
    request<RecapVideoJob[]>(`/projects/${projectId}/recap-scripts/${scriptId}/video-jobs`),

  listAiModelConfigs: (taskType?: AiTaskType) =>
    request<AiModelConfig[]>(`/ai-model-configs${taskType ? `?taskType=${taskType}` : ''}`),

  createAiModelConfig: (data: {
    label: string;
    provider: AiProvider;
    modelId: string;
    taskType: AiTaskType;
    apiKey: string;
  }) =>
    request<AiModelConfig>('/ai-model-configs', { method: 'POST', body: JSON.stringify(data) }),

  updateAiModelConfig: (
    id: string,
    data: Partial<{ label: string; modelId: string; apiKey: string }>,
  ) =>
    request<AiModelConfig>(`/ai-model-configs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteAiModelConfig: (id: string) =>
    request<void>(`/ai-model-configs/${id}`, { method: 'DELETE' }),

  activateAiModelConfig: (id: string) =>
    request<AiModelConfig>(`/ai-model-configs/${id}/activate`, { method: 'POST' }),
};
