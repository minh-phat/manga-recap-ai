'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError, Page, PanelRecord, RecapJob, RecapScript } from '@/lib/api';
import { getToken } from '@/lib/auth';
import VideoGenerator from './VideoGenerator';
import OriginalPagePreview from './OriginalPagePreview';

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
  const [pagesById, setPagesById] = useState<Map<string, Page>>(new Map());
  const [failedPanels, setFailedPanels] = useState<PanelRecord[]>([]);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [selectedFailedAttempt, setSelectedFailedAttempt] = useState<{
    panel: PanelRecord;
    attemptIndex: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const data = await api.getRecapJob(projectId, jobId);
      setJob(data);

      if (data.status === 'completed' && data.scriptId) {
        const scriptData = await api.getRecapScript(projectId, data.scriptId);
        setScript(scriptData);

        const pages = await api.getProjectPages(projectId);
        setPagesById(new Map(pages.map((page) => [page._id, page])));

        setSelectedPanelId((current) => current ?? scriptData.entries[0]?.panelId ?? null);

        const panelsByPage = await Promise.all(
          data.pageIds.map((pageId) => api.getPagePanels(projectId, pageId)),
        );
        setFailedPanels(
          panelsByPage.flat().filter((panel) => panel.status === 'failed'),
        );
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

  async function handleSaveNarration(panelId: string, text: string) {
    if (!script) return;
    try {
      const updated = await api.updateRecapScriptEntry(projectId, script._id, panelId, text);
      setScript(updated);
      setEditingPanelId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể lưu nội dung');
    }
  }

  const selectedEntry = script?.entries.find((entry) => entry.panelId === selectedPanelId) ?? null;
  const selectedPage = selectedEntry ? pagesById.get(selectedEntry.pageId) : undefined;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
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

        {script && <VideoGenerator projectId={projectId} scriptId={script._id} />}

        {script && (
          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-6">
            <div className="space-y-6">
              {script.entries.map((entry) => {
                const isSelected = entry.panelId === selectedPanelId;
                const isEditing = entry.panelId === editingPanelId;
                return (
                  <div
                    key={entry.panelId}
                    onClick={() => !isEditing && setSelectedPanelId(entry.panelId)}
                    className={`flex w-full gap-4 rounded-lg bg-white p-4 text-left shadow-sm ring-1 transition ${
                      isSelected ? 'ring-2 ring-blue-500' : 'ring-gray-100 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={entry.croppedImageUrl}
                      alt={`Panel ${entry.order}`}
                      className="h-40 w-40 flex-shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs font-medium text-gray-400">Panel {entry.order}</p>
                      {isEditing ? (
                        <div onClick={(e) => e.stopPropagation()} className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveNarration(entry.panelId, editingText)}
                              className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPanelId(null)}
                              className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-800">{entry.narrationText}</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPanelId(entry.panelId);
                              setEditingText(entry.narrationText);
                            }}
                            className="flex-shrink-0 text-xs font-medium text-blue-600 hover:underline"
                          >
                            Sửa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 lg:sticky lg:top-10 lg:mt-0">
              {selectedEntry && selectedPage && selectedEntry.bbox ? (
                <OriginalPagePreview
                  page={selectedPage}
                  bbox={selectedEntry.bbox}
                  order={selectedEntry.order}
                />
              ) : selectedEntry && !selectedEntry.bbox ? (
                <div className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">
                  Panel này thuộc job cũ, được tạo trước khi tính năng xem vị trí gốc ra mắt nên
                  chưa có dữ liệu toạ độ.
                </div>
              ) : (
                <div className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">
                  Chọn một panel để xem vị trí trên trang gốc.
                </div>
              )}
            </div>
          </div>
        )}

        {failedPanels.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">
              Panel bị cắt sai (đã thử lại {failedPanels[0]?.attempts.length ?? 3} lần)
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              AI trả toạ độ không hợp lệ cho các panel dưới đây kể cả sau khi thử lại nhiều lần,
              nên chúng đã bị loại khỏi recap. Bấm vào từng lần thử để xem AI đã cắt nhầm ở đâu
              trên trang gốc.
            </p>
            <div className="space-y-4">
              {failedPanels.map((panel) => {
                const page = pagesById.get(panel.pageId);
                return (
                  <div
                    key={panel._id}
                    className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-red-100"
                  >
                    <p className="mb-2 text-xs font-medium text-gray-400">
                      Panel {panel.order}
                      {page ? ` — trang ${page.pageIndex}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {panel.attempts.map((attempt, attemptIndex) => {
                        const isSelected =
                          selectedFailedAttempt?.panel._id === panel._id &&
                          selectedFailedAttempt?.attemptIndex === attemptIndex;
                        return (
                          <button
                            type="button"
                            key={attemptIndex}
                            onClick={() => setSelectedFailedAttempt({ panel, attemptIndex })}
                            className={`flex flex-col items-center gap-1 rounded-md p-2 ring-1 transition ${
                              isSelected
                                ? 'ring-2 ring-red-500'
                                : 'ring-gray-100 hover:ring-gray-300'
                            }`}
                          >
                            <img
                              src={attempt.croppedImageUrl}
                              alt={`Panel ${panel.order} lần ${attemptIndex + 1}`}
                              className="h-24 w-24 rounded object-cover"
                            />
                            <span className="text-xs text-gray-500">
                              Lần {attemptIndex + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedFailedAttempt && (
              (() => {
                const page = pagesById.get(selectedFailedAttempt.panel.pageId);
                const attempt =
                  selectedFailedAttempt.panel.attempts[selectedFailedAttempt.attemptIndex];
                if (!page || !attempt) return null;
                return (
                  <div className="mt-4 max-w-md">
                    <OriginalPagePreview
                      page={page}
                      bbox={attempt.bbox}
                      order={selectedFailedAttempt.panel.order}
                    />
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
}
