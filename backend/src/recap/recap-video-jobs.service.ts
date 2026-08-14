import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Collection, Db, ObjectId } from 'mongodb';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { MONGO_DB } from '../database/database.providers';
import { R2_CLIENT } from '../storage/r2.providers';
import { RecapVideoJob } from './recap-video-job.entity';
import { RecapScriptsService } from './recap-scripts.service';
import { computeEntryTimings, computeTotalDurationInFrames, VIDEO_FPS } from './duration.util';

@Injectable()
export class RecapVideoJobsService {
  private readonly logger = new Logger(RecapVideoJobsService.name);
  private readonly collection: Collection<RecapVideoJob>;
  private bundleServeUrlPromise: Promise<string> | null = null;

  constructor(
    @Inject(MONGO_DB) private readonly db: Db,
    @Inject(R2_CLIENT) private readonly r2: S3Client,
    private readonly configService: ConfigService,
    private readonly recapScriptsService: RecapScriptsService,
  ) {
    this.collection = this.db.collection<RecapVideoJob>('recapVideoJobs');
  }

  async findOne(id: string): Promise<RecapVideoJob> {
    const job = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!job) {
      throw new NotFoundException('Recap video job not found');
    }
    return job;
  }

  async createJob(
    projectId: string,
    scriptId: string,
    includeCaptions: boolean,
    createdBy: string,
  ): Promise<RecapVideoJob> {
    const now = new Date();
    const job: Omit<RecapVideoJob, '_id'> = {
      projectId: new ObjectId(projectId),
      scriptId: new ObjectId(scriptId),
      includeCaptions,
      status: 'queued',
      createdBy: new ObjectId(createdBy),
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(job);
    const created = { ...job, _id: result.insertedId };

    this.runJob(created._id.toString()).catch((error) => {
      this.logger.error(`Recap video job ${created._id.toString()} failed`, error);
    });

    return created;
  }

  private async updateJob(
    id: ObjectId,
    update: Partial<RecapVideoJob>,
  ): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { ...update, updatedAt: new Date() } },
    );
  }

  private getBundleServeUrl(): Promise<string> {
    if (!this.bundleServeUrlPromise) {
      this.bundleServeUrlPromise = (async () => {
        const { bundle } = await import('@remotion/bundler');
        return bundle({
          entryPoint: path.join(process.cwd(), 'video-render', 'index.ts'),
        });
      })();
    }
    return this.bundleServeUrlPromise;
  }

  private async runJob(jobId: string): Promise<void> {
    const job = await this.findOne(jobId);
    const jobObjectId = job._id!;

    try {
      await this.updateJob(jobObjectId, {
        status: 'running',
        currentStep: 'Đang chuẩn bị dữ liệu...',
      });

      const script = await this.recapScriptsService.findOne(
        job.scriptId.toString(),
      );

      const entries = script.entries.map((entry) => ({
        panelId: entry.panelId.toString(),
        imageUrl: entry.croppedImageUrl,
        narrationText: entry.narrationText,
      }));

      const timings = computeEntryTimings(
        entries.map((e) => e.narrationText),
        VIDEO_FPS,
      );
      const durationInFrames = computeTotalDurationInFrames(timings);

      await this.updateJob(jobObjectId, {
        currentStep: 'Đang render video...',
        durationInFrames,
      });

      const { selectComposition, renderMedia } = await import(
        '@remotion/renderer'
      );
      const serveUrl = await this.getBundleServeUrl();

      const inputProps = { entries, includeCaptions: job.includeCaptions };

      const composition = await selectComposition({
        serveUrl,
        id: 'RecapVideo',
        inputProps,
      });

      const outputPath = path.join(os.tmpdir(), `recap-video-${jobId}.mp4`);

      await renderMedia({
        serveUrl,
        composition,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps,
      });

      await this.updateJob(jobObjectId, {
        currentStep: 'Đang tải video lên...',
      });

      const buffer = fs.readFileSync(outputPath);
      const key = `projects/${job.projectId.toString()}/recap-videos/${uuid()}.mp4`;
      await this.r2.send(
        new PutObjectCommand({
          Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
          Key: key,
          Body: buffer,
          ContentType: 'video/mp4',
        }),
      );
      fs.unlinkSync(outputPath);

      const publicUrl = (
        this.configService.get<string>('R2_PUBLIC_URL') ?? ''
      ).replace(/\/$/, '');

      await this.updateJob(jobObjectId, {
        status: 'completed',
        currentStep: undefined,
        videoUrl: `${publicUrl}/${key}`,
        completedAt: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.updateJob(jobObjectId, { status: 'failed', error: message });
      throw error;
    }
  }
}
