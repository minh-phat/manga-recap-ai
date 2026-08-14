import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Db } from 'mongodb';
import { PanelBox } from '../ai-providers/ai-provider.interface';
import { Panel } from './panel.entity';
export declare class PanelsService {
    private readonly db;
    private readonly r2;
    private readonly configService;
    private readonly collection;
    constructor(db: Db, r2: S3Client, configService: ConfigService);
    findAllByPage(pageId: string): Promise<Panel[]>;
    createFromDetections(projectId: string, pageId: string, imageBuffer: Buffer, boxes: PanelBox[]): Promise<{
        panel: Panel;
        buffer: Buffer;
    }[]>;
}
