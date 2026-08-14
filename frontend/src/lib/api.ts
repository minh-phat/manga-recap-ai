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

  return res.json();
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

export type AiProvider = 'openrouter' | 'gemini' | 'anthropic';
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
  status: RecapJobStatus;
  currentStep?: string;
  error?: string;
  scriptId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface RecapScriptEntry {
  panelId: string;
  pageId: string;
  order: number;
  croppedImageUrl: string;
  narrationText: string;
}

export interface RecapScript {
  _id: string;
  projectId: string;
  jobId: string;
  entries: RecapScriptEntry[];
  createdAt: string;
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

  uploadPage: (projectId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadRequest<Page>(`/projects/${projectId}/pages`, formData);
  },

  createRecapJob: (projectId: string, pageIds: string[]) =>
    request<RecapJob>(`/projects/${projectId}/recap-jobs`, {
      method: 'POST',
      body: JSON.stringify({ pageIds }),
    }),

  getRecapJob: (projectId: string, jobId: string) =>
    request<RecapJob>(`/projects/${projectId}/recap-jobs/${jobId}`),

  getRecapScript: (projectId: string, scriptId: string) =>
    request<RecapScript>(`/projects/${projectId}/recap-scripts/${scriptId}`),

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
