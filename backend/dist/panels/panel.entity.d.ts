import { ObjectId } from 'mongodb';
export interface PanelBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface Panel {
    _id?: ObjectId;
    projectId: ObjectId;
    pageId: ObjectId;
    order: number;
    bbox: PanelBoundingBox;
    croppedImageUrl: string;
    createdAt: Date;
}
