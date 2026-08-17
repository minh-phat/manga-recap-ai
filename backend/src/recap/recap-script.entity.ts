import { ObjectId } from 'mongodb';
import { PanelBoundingBox } from '../panels/panel.entity';

export interface RecapScriptEntry {
  panelId: ObjectId;
  pageId: ObjectId;
  order: number;
  croppedImageUrl: string;
  narrationText: string;
  bbox: PanelBoundingBox;
}

export interface RecapScript {
  _id?: ObjectId;
  projectId: ObjectId;
  jobId: ObjectId;
  entries: RecapScriptEntry[];
  createdAt: Date;
}
