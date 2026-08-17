import { Page, PanelBoundingBox } from '@/lib/api';

interface OriginalPagePreviewProps {
  page: Page;
  bbox: PanelBoundingBox;
  order: number;
}

export default function OriginalPagePreview({ page, bbox, order }: OriginalPagePreviewProps) {
  const left = (bbox.x / page.width) * 100;
  const top = (bbox.y / page.height) * 100;
  const width = (bbox.width / page.width) * 100;
  const height = (bbox.height / page.height) * 100;

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <p className="mb-2 text-xs font-medium text-gray-400">
        Vị trí panel {order} trên trang gốc (trang {page.pageIndex})
      </p>
      <div
        className="relative w-full overflow-hidden rounded-md bg-gray-100"
        style={{ aspectRatio: `${page.width} / ${page.height}` }}
      >
        <img
          src={page.imageUrl}
          alt={`Trang gốc ${page.pageIndex}`}
          className="absolute inset-0 h-full w-full object-contain"
        />
        <div
          className="pointer-events-none absolute border-2 border-red-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
          }}
        />
      </div>
    </div>
  );
}
