'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, RecapVideoJob } from '@/lib/api';

const VIDEO_STATUS_LABEL: Record<RecapVideoJob['status'], string> = {
  queued: 'Đang chờ',
  running: 'Đang xử lý',
  completed: 'Hoàn tất',
  failed: 'Lỗi',
};

interface VideoGeneratorProps {
  projectId: string;
  scriptId: string;
}

export default function VideoGenerator({ projectId, scriptId }: VideoGeneratorProps) {
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [videoJob, setVideoJob] = useState<RecapVideoJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBusy = videoJob?.status === 'queued' || videoJob?.status === 'running';

  const pollVideoJob = useCallback(
    async (videoJobId: string) => {
      try {
        const data = await api.getRecapVideoJob(projectId, videoJobId);
        setVideoJob(data);
        if (data.status === 'completed' || data.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Không thể tải trạng thái video');
        if (pollRef.current) clearInterval(pollRef.current);
      }
    },
    [projectId],
  );

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    setError(null);
    try {
      const created = await api.createRecapVideoJob(projectId, scriptId, includeCaptions);
      setVideoJob(created);
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => void pollVideoJob(created._id), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tạo video');
    }
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Tạo video recap</h2>

      <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={includeCaptions}
          disabled={isBusy}
          onChange={(e) => setIncludeCaptions(e.target.checked)}
        />
        Bao gồm caption
      </label>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isBusy}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isBusy ? 'Đang tạo video...' : 'Tạo video'}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {videoJob && (
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            Trạng thái: {VIDEO_STATUS_LABEL[videoJob.status]}
          </p>
          {videoJob.currentStep && (
            <p className="text-sm text-gray-500">{videoJob.currentStep}</p>
          )}
          {videoJob.error && <p className="text-sm text-red-600">{videoJob.error}</p>}

          {videoJob.status === 'completed' && videoJob.videoUrl && (
            <div className="mt-3 space-y-2">
              <video controls src={videoJob.videoUrl} className="w-full rounded-lg" />
              <a
                href={videoJob.videoUrl}
                download
                className="inline-block text-sm text-blue-600 hover:underline"
              >
                Tải video
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
