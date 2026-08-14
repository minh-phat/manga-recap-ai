'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError, RecapJob, RecapScript } from '@/lib/api';
import { getToken } from '@/lib/auth';

const STATUS_LABEL: Record<RecapJob['status'], string> = {
  queued: 'Đang chờ',
  running: 'Đang xử lý',
  completed: 'Hoàn tất',
  failed: 'Lỗi',
};

export default function RecapJobPage() {
  const router = useRouter();
  const params = useParams<{ id: string; jobId: string }>();
  const projectId = params.id;
  const jobId = params.jobId;

  const [job, setJob] = useState<RecapJob | null>(null);
  const [script, setScript] = useState<RecapScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const data = await api.getRecapJob(projectId, jobId);
      setJob(data);

      if (data.status === 'completed' && data.scriptId) {
        const scriptData = await api.getRecapScript(projectId, data.scriptId);
        setScript(scriptData);
      }

      if (data.status === 'completed' || data.status === 'failed') {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải trạng thái job');
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [projectId, jobId]);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    void poll();
    pollRef.current = setInterval(() => void poll(), 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router, poll]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/projects/${projectId}`}
          className="mb-4 inline-block text-sm text-gray-600 hover:underline"
        >
          ← Quay lại project
        </Link>

        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Recap</h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {job && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Trạng thái: {STATUS_LABEL[job.status]}
              </span>
            </div>
            {job.currentStep && (
              <p className="mt-1 text-sm text-gray-500">{job.currentStep}</p>
            )}
            {job.error && <p className="mt-1 text-sm text-red-600">{job.error}</p>}
          </div>
        )}

        {script && (
          <div className="space-y-6">
            {script.entries.map((entry) => (
              <div
                key={entry.panelId}
                className="flex gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100"
              >
                <img
                  src={entry.croppedImageUrl}
                  alt={`Panel ${entry.order}`}
                  className="h-40 w-40 flex-shrink-0 rounded-md object-cover"
                />
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-400">Panel {entry.order}</p>
                  <p className="text-sm text-gray-800">{entry.narrationText}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
