import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Db } from 'mongodb';
import { RecapVideoJob } from './recap-video-job.entity';
import { RecapScriptsService } from './recap-scripts.service';
export declare class RecapVideoJobsService {
    private readonly db;
    private readonly r2;
    private readonly configService;
    private readonly recapScriptsService;
    private readonly logger;
    private readonly collection;
    private bundleServeUrlPromise;
    constructor(db: Db, r2: S3Client, configService: ConfigService, recapScriptsService: RecapScriptsService);
    findOne(id: string): Promise<RecapVideoJob>;
    createJob(projectId: string, scriptId: string, includeCaptions: boolean, createdBy: string): Promise<RecapVideoJob>;
    private updateJob;
    private getBundleServeUrl;
    private runJob;
}
