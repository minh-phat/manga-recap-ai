import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Collection, Db, ObjectId } from 'mongodb';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { MONGO_DB } from '../database/database.providers';
import { R2_CLIENT } from '../storage/r2.providers';
import { PanelBox } from '../ai-providers/ai-provider.interface';
import { Panel } from './panel.entity';
import { clampBoundingBox, cropRegion } from './image-cropper.util';

@Injectable()
export class PanelsService {
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

  async createFromDetections(
    projectId: string,
    pageId: string,
    imageBuffer: Buffer,
    boxes: PanelBox[],
  ): Promise<{ panel: Panel; buffer: Buffer }[]> {
    const metadata = await sharp(imageBuffer).metadata();
    const imageWidth = metadata.width ?? 0;
    const imageHeight = metadata.height ?? 0;

    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL') ?? '';
    const results: { panel: Panel; buffer: Buffer }[] = [];

    for (let i = 0; i < boxes.length; i += 1) {
      const normalized = boxes[i];
      const pixelBox = {
        x: normalized.x * imageWidth,
        y: normalized.y * imageHeight,
        width: normalized.width * imageWidth,
        height: normalized.height * imageHeight,
      };
      const bbox = clampBoundingBox(pixelBox, imageWidth, imageHeight);
      const croppedBuffer = await cropRegion(imageBuffer, bbox);

      const key = `projects/${projectId}/pages/${pageId}/panels/${uuid()}.png`;
      await this.r2.send(
        new PutObjectCommand({
          Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
          Key: key,
          Body: croppedBuffer,
          ContentType: 'image/png',
        }),
      );

      const panel: Omit<Panel, '_id'> = {
        projectId: new ObjectId(projectId),
        pageId: new ObjectId(pageId),
        order: i + 1,
        bbox,
        croppedImageUrl: `${publicUrl.replace(/\/$/, '')}/${key}`,
        createdAt: new Date(),
      };

      const result = await this.collection.insertOne(panel);
      results.push({
        panel: { ...panel, _id: result.insertedId },
        buffer: croppedBuffer,
      });
    }

    return results;
  }
}
