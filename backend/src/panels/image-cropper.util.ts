import sharp from 'sharp';
import { PanelBoundingBox } from './panel.entity';

export function clampBoundingBox(
  bbox: PanelBoundingBox,
  imageWidth: number,
  imageHeight: number,
): PanelBoundingBox {
  const x = Math.max(0, Math.min(Math.round(bbox.x), imageWidth - 1));
  const y = Math.max(0, Math.min(Math.round(bbox.y), imageHeight - 1));
  const width = Math.max(1, Math.min(Math.round(bbox.width), imageWidth - x));
  const height = Math.max(
    1,
    Math.min(Math.round(bbox.height), imageHeight - y),
  );
  return { x, y, width, height };
}

export async function cropRegion(
  buffer: Buffer,
  bbox: PanelBoundingBox,
): Promise<Buffer> {
  return sharp(buffer)
    .extract({
      left: bbox.x,
      top: bbox.y,
      width: bbox.width,
      height: bbox.height,
    })
    .png()
    .toBuffer();
}
