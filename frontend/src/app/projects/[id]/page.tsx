'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError, Page, PageStatus, Project } from '@/lib/api';
import { getToken } from '@/lib/auth';

const STATUS_LABEL: Record<PageStatus, string> = {
  uploaded: 'Đã tải lên',
  segmenting: 'Đang phân tách',
  segmented: 'Đã phân tách',
  failed: 'Lỗi',
};

const STATUS_CLASS: Record<PageStatus, string> = {
  uploaded: 'bg-gray-100 text-gray-700',
  segmenting: 'bg-blue-100 text-blue-700',
  segmented: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectData, pagesData] = await Promise.all([
        api.getProject(projectId),
        api.getProjectPages(projectId),
      ]);
      setProject(projectData);
      setPages(pagesData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể tải project');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    void load();
  }, [router, load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const page = await api.uploadPage(projectId, file);
      setPages((prev) => [...prev, page]);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/projects" className="mb-4 inline-block text-sm text-gray-600 hover:underline">
          ← Quay lại danh sách
        </Link>

        {loading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : project ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
              <p className="text-xs text-gray-400">
                Tạo lúc {new Date(project.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="mb-8 rounded-lg bg-white p-4 shadow">
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Tải lên ảnh manga gốc
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                />
                {uploading && <span className="text-sm text-gray-500">Đang tải lên...</span>}
              </div>
              {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
            </div>

            {pages.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có ảnh nào.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {pages.map((page) => (
                  <div
                    key={page._id}
                    className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-100"
                  >
                    <img
                      src={page.imageUrl}
                      alt={`Trang ${page.pageIndex}`}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Trang {page.pageIndex}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[page.status]}`}
                        >
                          {STATUS_LABEL[page.status]}
                        </span>
                      </div>
                      {page.panelCount > 0 && (
                        <p className="mt-1 text-xs text-gray-400">{page.panelCount} panel</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
