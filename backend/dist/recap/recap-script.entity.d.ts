import { ObjectId } from 'mongodb';
export interface RecapScriptEntry {
    panelId: ObjectId;
    pageId: ObjectId;
    order: number;
    croppedImageUrl: string;
    narrationText: string;
}
export interface RecapScript {
    _id?: ObjectId;
    projectId: ObjectId;
    jobId: ObjectId;
    entries: RecapScriptEntry[];
    createdAt: Date;
}
