import { AiModelConfigsService } from '../ai-models/ai-model-configs.service';
import { AiTaskType } from '../ai-models/ai-model-config.entity';
import { AiProviderStrategy } from './ai-provider.interface';
export declare class AiProviderFactory {
    private readonly aiModelConfigsService;
    constructor(aiModelConfigsService: AiModelConfigsService);
    forTask(taskType: AiTaskType): Promise<AiProviderStrategy>;
}
