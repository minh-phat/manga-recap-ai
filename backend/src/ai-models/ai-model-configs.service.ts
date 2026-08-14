import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGO_DB } from '../database/database.providers';
import { AiModelConfig, AiTaskType } from './ai-model-config.entity';
import { CreateAiModelConfigDto } from './dto/create-ai-model-config.dto';
import { UpdateAiModelConfigDto } from './dto/update-ai-model-config.dto';
import { decryptApiKey, encryptApiKey, maskApiKey } from './crypto.util';

@Injectable()
export class AiModelConfigsService {
  private readonly collection: Collection<AiModelConfig>;

  constructor(
    @Inject(MONGO_DB) private readonly db: Db,
    private readonly configService: ConfigService,
  ) {
    this.collection = this.db.collection<AiModelConfig>('aiModelConfigs');
  }

  private get encryptionSecret(): string {
    return (
      this.configService.get<string>('AI_KEY_ENCRYPTION_SECRET') ?? 'change-me'
    );
  }

  findAll(taskType?: AiTaskType): Promise<AiModelConfig[]> {
    const filter = taskType ? { taskType } : {};
    return this.collection.find(filter).sort({ createdAt: -1 }).toArray();
  }

  async findOne(id: string): Promise<AiModelConfig> {
    const config = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!config) {
      throw new NotFoundException('AI model config not found');
    }
    return config;
  }

  async getActive(taskType: AiTaskType): Promise<AiModelConfig> {
    const config = await this.collection.findOne({ taskType, isActive: true });
    if (!config) {
      throw new NotFoundException(
        `No active AI model configured for task "${taskType}"`,
      );
    }
    return config;
  }

  getDecryptedApiKey(config: AiModelConfig): string {
    return decryptApiKey(config.apiKeyEncrypted, this.encryptionSecret);
  }

  async create(
    dto: CreateAiModelConfigDto,
    createdBy: string,
  ): Promise<AiModelConfig> {
    const now = new Date();
    const config: Omit<AiModelConfig, '_id'> = {
      label: dto.label,
      provider: dto.provider,
      modelId: dto.modelId,
      taskType: dto.taskType,
      apiKeyEncrypted: encryptApiKey(dto.apiKey, this.encryptionSecret),
      apiKeyMasked: maskApiKey(dto.apiKey),
      isActive: false,
      createdBy: new ObjectId(createdBy),
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.collection.insertOne(config);
    return { ...config, _id: result.insertedId };
  }

  async update(
    id: string,
    dto: UpdateAiModelConfigDto,
  ): Promise<AiModelConfig> {
    const update: Partial<AiModelConfig> = { updatedAt: new Date() };
    if (dto.label !== undefined) update.label = dto.label;
    if (dto.modelId !== undefined) update.modelId = dto.modelId;
    if (dto.apiKey !== undefined) {
      update.apiKeyEncrypted = encryptApiKey(dto.apiKey, this.encryptionSecret);
      update.apiKeyMasked = maskApiKey(dto.apiKey);
    }

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' },
    );
    if (!result) {
      throw new NotFoundException('AI model config not found');
    }
    return result;
  }

  async remove(id: string): Promise<void> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      throw new NotFoundException('AI model config not found');
    }
  }

  async activate(id: string): Promise<AiModelConfig> {
    const config = await this.findOne(id);
    await this.collection.updateMany(
      { taskType: config.taskType },
      { $set: { isActive: false, updatedAt: new Date() } },
    );
    await this.collection.updateOne(
      { _id: config._id },
      { $set: { isActive: true, updatedAt: new Date() } },
    );
    return this.findOne(id);
  }
}
