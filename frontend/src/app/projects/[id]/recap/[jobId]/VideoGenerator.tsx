'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError, RECAP_LANGUAGES, RecapVideoJob } from '@/lib/api';

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
  const [language, setLanguage] = useState('vi-VN');
  const [videoJob, setVideoJob] = useState<RecapVideoJob | null>(null);
  const [videos, setVideos] = useState<RecapVideoJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBusy = videoJob?.status === 'queued' || videoJob?.status === 'running';

  const loadVideos = useCallback(async () => {
    try {
      const data = await api.listRecapVideoJobs(projectId, scriptId);
      setVideos(data);
    } catch {
      // ignore — history list is a non-critical enhancement
    }
  }, [projectId, scriptId]);

  const pollVideoJob = useCallback(
    async (videoJobId: string) => {
      try {
        const data = await api.getRecapVideoJob(projectId, videoJobId);
        setVideoJob(data);
        if (data.status === 'completed' || data.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          void loadVideos();
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Không thể tải trạng thái video');
        if (pollRef.current) clearInterval(pollRef.current);
      }
    },
    [projectId, loadVideos],
  );

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    setError(null);
    try {
      const created = await api.createRecapVideoJob(projectId, scriptId, includeCaptions, language);
      setVideoJob(created);
      void loadVideos();
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

      <label className="mb-3 flex items-center gap-2 text-sm text-gray-700">
        Ngôn ngữ đọc
        <select
          value={language}
          disabled={isBusy}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          {RECAP_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
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

      <div className="mt-6 border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Video đã tạo ({videos.length})
        </h3>
        {videos.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có video nào được tạo.</p>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => (
              <div key={video._id} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {new Date(video.createdAt).toLocaleString()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      video.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : video.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {VIDEO_STATUS_LABEL[video.status]}
                  </span>
                </div>
                {video.error && <p className="mt-1 text-xs text-red-600">{video.error}</p>}
                {video.status === 'completed' && video.videoUrl && (
                  <div className="mt-2 space-y-2">
                    <video controls src={video.videoUrl} className="w-full rounded-lg" />
                    <a
                      href={video.videoUrl}
                      download
                      className="inline-block text-sm text-blue-600 hover:underline"
                    >
                      Tải video
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
