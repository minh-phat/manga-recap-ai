import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Db } from 'mongodb';
import { Page } from './page.entity';
export declare class PagesService {
    private readonly db;
    private readonly r2;
    private readonly configService;
    private readonly logger;
    private readonly collection;
    constructor(db: Db, r2: S3Client, configService: ConfigService);
    findAllByProject(projectId: string): Promise<Page[]>;
    findById(id: string): Promise<Page | null>;
    createMany(projectId: string, files: Express.Multer.File[]): Promise<Page[]>;
    reorder(projectId: string, pageIds: string[]): Promise<Page[]>;
    remove(projectId: string, pageId: string): Promise<void>;
}
