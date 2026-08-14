import type { AiProvider, AiTaskType } from '../ai-model-config.entity';
export declare class CreateAiModelConfigDto {
    label: string;
    provider: AiProvider;
    modelId: string;
    taskType: AiTaskType;
    apiKey: string;
}
