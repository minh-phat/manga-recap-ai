import { ConfigService } from '@nestjs/config';
import { Db } from 'mongodb';
import { AiModelConfig, AiTaskType } from './ai-model-config.entity';
import { CreateAiModelConfigDto } from './dto/create-ai-model-config.dto';
import { UpdateAiModelConfigDto } from './dto/update-ai-model-config.dto';
export declare class AiModelConfigsService {
    private readonly db;
    private readonly configService;
    private readonly collection;
    constructor(db: Db, configService: ConfigService);
    private get encryptionSecret();
    findAll(taskType?: AiTaskType): Promise<AiModelConfig[]>;
    findOne(id: string): Promise<AiModelConfig>;
    getActive(taskType: AiTaskType): Promise<AiModelConfig>;
    getDecryptedApiKey(config: AiModelConfig): string;
    create(dto: CreateAiModelConfigDto, createdBy: string): Promise<AiModelConfig>;
    update(id: string, dto: UpdateAiModelConfigDto): Promise<AiModelConfig>;
    remove(id: string): Promise<void>;
    activate(id: string): Promise<AiModelConfig>;
}
