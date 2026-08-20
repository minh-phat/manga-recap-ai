import { ObjectId } from 'mongodb';

export type RecapVideoJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface RecapVideoJob {
  _id?: ObjectId;
  projectId: ObjectId;
  scriptId: ObjectId;
  includeCaptions: boolean;
  language: string;
  pitch?: number;
  rate?: number;
  status: RecapVideoJobStatus;
  currentStep?: string;
  error?: string;
  videoUrl?: string;
  durationInFrames?: number;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
