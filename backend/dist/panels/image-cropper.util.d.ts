import { PanelBoundingBox } from './panel.entity';
export declare function clampBoundingBox(bbox: PanelBoundingBox, imageWidth: number, imageHeight: number): PanelBoundingBox;
export declare function cropRegion(buffer: Buffer, bbox: PanelBoundingBox): Promise<Buffer>;
