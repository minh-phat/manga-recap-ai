import { ObjectId } from 'mongodb';

export type PageStatus = 'uploaded' | 'segmenting' | 'segmented' | 'failed';

export interface Page {
  _id?: ObjectId;
  projectId: ObjectId;
  pageIndex: number;
  imageUrl: string;
  width: number;
  height: number;
  panelCount: number;
  status: PageStatus;
  createdAt: Date;
}
