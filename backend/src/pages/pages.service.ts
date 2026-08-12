import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Collection, Db, ObjectId } from 'mongodb';
import { imageSize } from 'image-size';
import { v4 as uuid } from 'uuid';
import { MONGO_DB } from '../database/database.providers';
import { R2_CLIENT } from '../storage/r2.providers';
import { Page } from './page.entity';

@Injectable()
export class PagesService {
  private readonly collection: Collection<Page>;

  constructor(
    @Inject(MONGO_DB) private readonly db: Db,
    @Inject(R2_CLIENT) private readonly r2: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.collection = this.db.collection<Page>('pages');
  }

  findAllByProject(projectId: string): Promise<Page[]> {
    return this.collection
      .find({ projectId: new ObjectId(projectId) })
      .sort({ pageIndex: 1 })
      .toArray();
  }

  async create(projectId: string, file: Express.Multer.File): Promise<Page> {
    const nextIndex = await this.collection.countDocuments({
      projectId: new ObjectId(projectId),
    });

    let width = 0;
    let height = 0;
    try {
      const dimensions = imageSize(file.buffer);
      width = dimensions.width;
      height = dimensions.height;
    } catch {
      // keep width/height as 0 if the buffer can't be parsed
    }

    const extension = file.originalname.includes('.')
      ? file.originalname.split('.').pop()
      : 'jpg';
    const key = `projects/${projectId}/pages/${uuid()}.${extension}`;

    await this.r2.send(
      new PutObjectCommand({
        Bucket: this.configService.get<string>('R2_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const publicUrl = this.configService.get<string>('R2_PUBLIC_URL') ?? '';

    const page: Omit<Page, '_id'> = {
      projectId: new ObjectId(projectId),
      pageIndex: nextIndex + 1,
      imageUrl: `${publicUrl.replace(/\/$/, '')}/${key}`,
      width,
      height,
      panelCount: 0,
      status: 'uploaded',
      createdAt: new Date(),
    };

    const result = await this.collection.insertOne(page);
    return { ...page, _id: result.insertedId };
  }
}
