import sharp from 'sharp';
import { PanelBox } from '../ai-providers/ai-provider.interface';
import { PanelBoundingBox } from './panel.entity';

const MIN_BOX_FRACTION = 0.015;
const MIN_BOX_PIXELS = 8;

export function isDegenerateNormalizedBox(box: PanelBox): boolean {
  const { x, y, width, height } = box;
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return true;
  }
  if (width <= MIN_BOX_FRACTION || height <= MIN_BOX_FRACTION) {
    return true;
  }
  if (x < -0.05 || x > 1.05 || y < -0.05 || y > 1.05) {
    return true;
  }
  return false;
}

export function isDegenerateBox(bbox: PanelBoundingBox): boolean {
  return bbox.width < MIN_BOX_PIXELS || bbox.height < MIN_BOX_PIXELS;
}

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
