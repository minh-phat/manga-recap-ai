import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Db } from 'mongodb';
import { AiProviderStrategy, PanelBox } from '../ai-providers/ai-provider.interface';
import { Panel } from './panel.entity';
export declare class PanelsService {
    private readonly db;
    private readonly r2;
    private readonly configService;
    private readonly logger;
    private readonly collection;
    constructor(db: Db, r2: S3Client, configService: ConfigService);
    findAllByPage(pageId: string): Promise<Panel[]>;
    private uploadCrop;
    createFromDetections(projectId: string, pageId: string, imageBuffer: Buffer, boxes: PanelBox[], mimeType: string, panelDetectionClient: AiProviderStrategy): Promise<{
        panel: Panel;
        buffer: Buffer;
    }[]>;
}
