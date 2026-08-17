import { PanelBox } from '../ai-providers/ai-provider.interface';
import { PanelBoundingBox } from './panel.entity';
export declare function isDegenerateNormalizedBox(box: PanelBox): boolean;
export declare function isDegenerateBox(bbox: PanelBoundingBox): boolean;
export declare function clampBoundingBox(bbox: PanelBoundingBox, imageWidth: number, imageHeight: number): PanelBoundingBox;
export declare function cropRegion(buffer: Buffer, bbox: PanelBoundingBox): Promise<Buffer>;
