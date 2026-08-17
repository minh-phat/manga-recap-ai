import { ObjectId } from 'mongodb';

export interface PanelBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PanelStatus = 'ok' | 'failed';

export interface PanelAttempt {
  bbox: PanelBoundingBox;
  croppedImageUrl: string;
}

export interface Panel {
  _id?: ObjectId;
  projectId: ObjectId;
  pageId: ObjectId;
  order: number;
  bbox: PanelBoundingBox;
  croppedImageUrl: string;
  status: PanelStatus;
  attempts: PanelAttempt[];
  createdAt: Date;
}
