import { ConfigService } from '@nestjs/config';
import { AiModelConfigsService } from '../ai-models/ai-model-configs.service';
import { AiTaskType } from '../ai-models/ai-model-config.entity';
import { AiProviderStrategy } from './ai-provider.interface';
export declare class AiProviderFactory {
    private readonly aiModelConfigsService;
    private readonly configService;
    constructor(aiModelConfigsService: AiModelConfigsService, configService: ConfigService);
    forTask(taskType: AiTaskType): Promise<AiProviderStrategy>;
}
