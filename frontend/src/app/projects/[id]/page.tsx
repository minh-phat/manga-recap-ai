'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { api, ApiError, Page, PageStatus, Project, RecapJob, RECAP_LANGUAGES } from '@/lib/api';
import { getToken, isAdmin } from '@/lib/auth';

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

const RECAP_STATUS_LABEL: Record<RecapJob['status'], string> = {
  queued: 'Đang chờ',
  running: 'Đang xử lý',
  completed: 'Hoàn tất',
  failed: 'Lỗi',
};

const RECAP_STATUS_COLOR: Record<RecapJob['status'], 'default' | 'info' | 'success' | 'error'> = {
  queued: 'default',
  running: 'info',
  completed: 'success',
  failed: 'error',
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [recapJobs, setRecapJobs] = useState<RecapJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [language, setLanguage] = useState('vi-VN');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectData, pagesData, recapJobsData] = await Promise.all([
        api.getProject(projectId),
        api.getProjectPages(projectId),
        api.listRecapJobs(projectId),
      ]);
      setProject(projectData);
      setPages(pagesData);
      setRecapJobs(recapJobsData);
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

  function toggleSelect(pageId: string) {
    setSelectedIds((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId],
    );
  }

  async function handleGenerateRecap() {
    if (selectedIds.length === 0) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      const orderedIds = pages
        .filter((page) => selectedIds.includes(page._id))
        .map((page) => page._id);
      const job = await api.createRecapJob(projectId, orderedIds, language);
      setRecapJobs((prev) => [job, ...prev]);
      router.push(`/projects/${projectId}/recap/${job._id}`);
    } catch (err) {
      setGenerateError(err instanceof ApiError ? err.message : 'Không thể tạo recap');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/projects" className="inline-block text-sm text-gray-600 hover:underline">
            ← Quay lại danh sách
          </Link>
          {isAdmin() && (
            <Link href="/admin/ai-models" className="text-sm text-blue-600 hover:underline">
              Quản trị AI model
            </Link>
          )}
        </div>

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

            <Accordion sx={{ mb: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 500 }}>
                  Recap đã tạo ({recapJobs.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {recapJobs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
                    Chưa có recap nào được tạo.
                  </Typography>
                ) : (
                  <List disablePadding>
                    {recapJobs.map((job) => (
                      <ListItemButton
                        key={job._id}
                        component={Link}
                        href={`/projects/${projectId}/recap/${job._id}`}
                      >
                        <ListItemText
                          primary={
                            RECAP_LANGUAGES.find((lang) => lang.code === job.language)?.label ??
                            job.language
                          }
                          secondary={new Date(job.createdAt).toLocaleString()}
                        />
                        <Chip
                          label={RECAP_STATUS_LABEL[job.status]}
                          color={RECAP_STATUS_COLOR[job.status]}
                          size="small"
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>

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
              <>
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-white p-4 shadow">
                  <span className="text-sm text-gray-700">
                    Đã chọn {selectedIds.length} trang
                  </span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={generating}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
                  >
                    {RECAP_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleGenerateRecap}
                    disabled={selectedIds.length === 0 || generating}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {generating ? 'Đang tạo...' : 'Tạo recap'}
                  </button>
                  {generateError && <p className="text-sm text-red-600">{generateError}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {pages.map((page) => (
                  <div
                    key={page._id}
                    className={`overflow-hidden rounded-lg bg-white shadow-sm ring-1 ${selectedIds.includes(page._id) ? 'ring-blue-500' : 'ring-gray-100'}`}
                  >
                    <div className="relative">
                      <img
                        src={page.imageUrl}
                        alt={`Trang ${page.pageIndex}`}
                        className="h-40 w-full object-cover"
                      />
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(page._id)}
                        onChange={() => toggleSelect(page._id)}
                        className="absolute top-2 left-2 h-5 w-5"
                      />
                    </div>
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
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
