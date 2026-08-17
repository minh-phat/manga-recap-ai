import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGO_DB } from '../database/database.providers';
import { PagesService } from '../pages/pages.service';
import { PanelsService } from '../panels/panels.service';
import { AiProviderFactory } from '../ai-providers/ai-provider.factory';
import { RecapJob } from './recap-job.entity';
import { RecapScriptEntry } from './recap-script.entity';
import { RecapScriptsService } from './recap-scripts.service';

const IMAGE_MIME_TYPE = 'image/png';

@Injectable()
export class RecapJobsService {
  private readonly logger = new Logger(RecapJobsService.name);
  private readonly collection: Collection<RecapJob>;

  constructor(
    @Inject(MONGO_DB) private readonly db: Db,
    private readonly pagesService: PagesService,
    private readonly panelsService: PanelsService,
    private readonly aiProviderFactory: AiProviderFactory,
    private readonly recapScriptsService: RecapScriptsService,
  ) {
    this.collection = this.db.collection<RecapJob>('recapJobs');
  }

  findAllByProject(projectId: string): Promise<RecapJob[]> {
    return this.collection
      .find({ projectId: new ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findOne(id: string): Promise<RecapJob> {
    const job = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!job) {
      throw new NotFoundException('Recap job not found');
    }
    return job;
  }

  async createJob(
    projectId: string,
    pageIds: string[],
    createdBy: string,
    language: string,
  ): Promise<RecapJob> {
    const now = new Date();
    const job: Omit<RecapJob, '_id'> = {
      projectId: new ObjectId(projectId),
      pageIds: pageIds.map((id) => new ObjectId(id)),
      language,
      status: 'queued',
      createdBy: new ObjectId(createdBy),
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(job);
    const created = { ...job, _id: result.insertedId };

    this.runJob(created._id.toString()).catch((error) => {
      this.logger.error(`Recap job ${created._id.toString()} failed`, error);
    });

    return created;
  }

  private async updateJob(
    id: ObjectId,
    update: Partial<RecapJob>,
  ): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { ...update, updatedAt: new Date() } },
    );
  }

  private async runJob(jobId: string): Promise<void> {
    const job = await this.findOne(jobId);
    const jobObjectId = job._id!;

    try {
      await this.updateJob(jobObjectId, {
        status: 'running',
        currentStep: 'Đang khởi tạo...',
      });

      const panelDetectionClient =
        await this.aiProviderFactory.forTask('panel_detection');
      const narrationClient = await this.aiProviderFactory.forTask('narration');

      let storySoFar = '';
      const entries: RecapScriptEntry[] = [];
      let globalOrder = 1;

      for (
        let pageNumber = 0;
        pageNumber < job.pageIds.length;
        pageNumber += 1
      ) {
        const pageId = job.pageIds[pageNumber];
        const page = await this.pagesService.findById(pageId.toString());
        if (!page) {
          continue;
        }

        await this.updateJob(jobObjectId, {
          currentStep: `Đang tách khung trang ${pageNumber + 1}/${job.pageIds.length}`,
        });

        const imageRes = await fetch(page.imageUrl);
        if (!imageRes.ok) {
          throw new Error(
            `Không thể tải ảnh trang ${page.pageIndex}: ${imageRes.status}`,
          );
        }
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

        const boxes = await panelDetectionClient.detectPanels({
          imageBuffer,
          mimeType: IMAGE_MIME_TYPE,
        });

        if (boxes.length === 0) {
          continue;
        }

        const cropped = await this.panelsService.createFromDetections(
          job.projectId.toString(),
          pageId.toString(),
          imageBuffer,
          boxes,
          IMAGE_MIME_TYPE,
          panelDetectionClient,
        );

        await this.updateJob(jobObjectId, {
          currentStep: `Đang sinh nội dung trang ${pageNumber + 1}/${job.pageIds.length}`,
        });

        const narrations = await narrationClient.generateNarration({
          panels: cropped.map(({ buffer }) => ({
            imageBuffer: buffer,
            mimeType: IMAGE_MIME_TYPE,
          })),
          storySoFar,
          pageIndex: page.pageIndex,
          language: job.language,
        });

        for (let i = 0; i < cropped.length; i += 1) {
          const narrationText = narrations[i] ?? '';
          entries.push({
            panelId: cropped[i].panel._id!,
            pageId,
            order: globalOrder,
            croppedImageUrl: cropped[i].panel.croppedImageUrl,
            narrationText,
            bbox: cropped[i].panel.bbox,
          });
          globalOrder += 1;
        }

        storySoFar = `${storySoFar}\n${narrations.join(' ')}`.trim();
      }

      const script = await this.recapScriptsService.create({
        projectId: job.projectId,
        jobId: jobObjectId,
        entries,
        createdAt: new Date(),
      });

      await this.updateJob(jobObjectId, {
        status: 'completed',
        currentStep: undefined,
        scriptId: script._id,
        completedAt: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.updateJob(jobObjectId, { status: 'failed', error: message });
      throw error;
    }
  }
}
