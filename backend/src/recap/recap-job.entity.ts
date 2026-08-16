import { ObjectId } from 'mongodb';

export type RecapJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface RecapJob {
  _id?: ObjectId;
  projectId: ObjectId;
  pageIds: ObjectId[];
  language: string;
  status: RecapJobStatus;
  currentStep?: string;
  error?: string;
  scriptId?: ObjectId;
  panelDetectionModelId?: ObjectId;
  narrationModelId?: ObjectId;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
