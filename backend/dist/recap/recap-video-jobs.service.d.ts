import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { Db } from 'mongodb';
import { AiProviderFactory } from '../ai-providers/ai-provider.factory';
import { EdgeTtsClient } from '../tts/edge-tts.client';
import { RecapVideoJob } from './recap-video-job.entity';
import { RecapScriptsService } from './recap-scripts.service';
export declare class RecapVideoJobsService {
    private readonly db;
    private readonly r2;
    private readonly configService;
    private readonly recapScriptsService;
    private readonly aiProviderFactory;
    private readonly edgeTtsClient;
    private readonly logger;
    private readonly collection;
    private bundleServeUrlPromise;
    constructor(db: Db, r2: S3Client, configService: ConfigService, recapScriptsService: RecapScriptsService, aiProviderFactory: AiProviderFactory, edgeTtsClient: EdgeTtsClient);
    findOne(id: string): Promise<RecapVideoJob>;
    findAllByScript(scriptId: string): Promise<RecapVideoJob[]>;
    createJob(projectId: string, scriptId: string, includeCaptions: boolean, language: string, createdBy: string): Promise<RecapVideoJob>;
    private updateJob;
    private getBundleServeUrl;
    private runJob;
}
