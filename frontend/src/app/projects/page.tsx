'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, Project } from '@/lib/api';
import { clearSession, getToken, getUser } from '@/lib/auth';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [userName] = useState(() => getUser()?.name ?? '');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải danh sách project');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    void loadProjects();
  }, [router, loadProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const project = await api.createProject(name.trim());
      setProjects((prev) => [project, ...prev]);
      setName('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tạo project');
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Projects{userName ? ` của ${userName}` : ''}
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Đăng xuất
          </button>
        </div>

        <form onSubmit={handleCreate} className="mb-8 flex gap-2 rounded-lg bg-white p-4 shadow">
          <input
            type="text"
            placeholder="Tên project mới"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Đang tạo...' : 'Tạo project'}
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có project nào.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li
                key={project._id}
                className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <p className="font-medium text-gray-900">{project.name}</p>
                <p className="text-xs text-gray-400">
                  Tạo lúc {new Date(project.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
