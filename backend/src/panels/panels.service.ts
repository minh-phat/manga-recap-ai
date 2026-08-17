import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Collection, Db, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { MONGO_DB } from '../database/database.providers';
import { R2_CLIENT } from '../storage/r2.providers';
import { AiProviderStrategy, PanelBox } from '../ai-providers/ai-provider.interface';
import { Panel, PanelAttempt } from './panel.entity';
import {
  clampBoundingBox,
  cropRegion,
  isDegenerateBox,
  isDegenerateNormalizedBox,
} from './image-cropper.util';

const MAX_ATTEMPTS = 3;

@Injectable()
export class PanelsService {
  private readonly logger = new Logger(PanelsService.name);
  private readonly collection: Collection<Panel>;

  constructor(
    @Inject(MONGO_DB) private readonly db: Db,
    @Inject(R2_CLIENT) private readonly r2: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.collection = this.db.collection<Panel>('panels');
  }

  findAllByPage(pageId: string): Promise<Panel[]> {
    return this.collection
      .find({ pageId: new ObjectId(pageId) })
      .sort({ order: 1 })
      .toArray();
  }

  private async uploadCrop(
    projectId: string,
    pageId: string,
    buffer: Buffer,
  ): Promise<string> {
    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL') ?? '';
    const key = `projects/${projectId}/pages/${pageId}/panels/${uuid()}.png`;
    await this.r2.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
      }),
    );
    return `${publicUrl.replace(/\/$/, '')}/${key}`;
  }

  async createFromDetections(
    projectId: string,
    pageId: string,
    imageBuffer: Buffer,
    boxes: PanelBox[],
    mimeType: string,
    panelDetectionClient: AiProviderStrategy,
  ): Promise<{ panel: Panel; buffer: Buffer }[]> {
    const metadata = await sharp(imageBuffer).metadata();
    const imageWidth = metadata.width ?? 0;
    const imageHeight = metadata.height ?? 0;

    const results: { panel: Panel; buffer: Buffer }[] = [];

    for (let i = 0; i < boxes.length; i += 1) {
      let candidate = boxes[i];
      const attempts: PanelAttempt[] = [];
      let finalBuffer: Buffer | null = null;
      let status: Panel['status'] = 'failed';

      for (let attemptNum = 1; attemptNum <= MAX_ATTEMPTS; attemptNum += 1) {
        const pixelBox = {
          x: candidate.x * imageWidth,
          y: candidate.y * imageHeight,
          width: candidate.width * imageWidth,
          height: candidate.height * imageHeight,
        };
        const bbox = clampBoundingBox(pixelBox, imageWidth, imageHeight);
        const croppedBuffer = await cropRegion(imageBuffer, bbox);
        const croppedImageUrl = await this.uploadCrop(
          projectId,
          pageId,
          croppedBuffer,
        );
        attempts.push({ bbox, croppedImageUrl });
        finalBuffer = croppedBuffer;

        const valid =
          !isDegenerateNormalizedBox(candidate) && !isDegenerateBox(bbox);
        if (valid) {
          status = 'ok';
          break;
        }

        if (attemptNum < MAX_ATTEMPTS) {
          this.logger.warn(
            `Panel detection degenerate box (page=${pageId} order=${i + 1} attempt=${attemptNum}): ${JSON.stringify(candidate)} -> retrying`,
          );
          candidate = await panelDetectionClient.redetectPanelBox({
            imageBuffer,
            mimeType,
            previousBox: candidate,
            order: i + 1,
            totalPanels: boxes.length,
          });
        } else {
          this.logger.warn(
            `Panel detection still degenerate after ${MAX_ATTEMPTS} attempts (page=${pageId} order=${i + 1}) — flagging for manual review`,
          );
        }
      }

      const lastAttempt = attempts[attempts.length - 1];
      const panel: Omit<Panel, '_id'> = {
        projectId: new ObjectId(projectId),
        pageId: new ObjectId(pageId),
        order: i + 1,
        bbox: lastAttempt.bbox,
        croppedImageUrl: lastAttempt.croppedImageUrl,
        status,
        attempts,
        createdAt: new Date(),
      };

      const result = await this.collection.insertOne(panel);
      if (status === 'ok') {
        results.push({
          panel: { ...panel, _id: result.insertedId },
          buffer: finalBuffer!,
        });
      }
    }

    return results;
  }
}
