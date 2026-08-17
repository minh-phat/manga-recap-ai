import { ObjectId } from 'mongodb';
export type AiProvider = 'openrouter' | 'gemini' | 'anthropic' | 'local';
export type AiTaskType = 'panel_detection' | 'narration';
export interface AiModelConfig {
    _id?: ObjectId;
    label: string;
    provider: AiProvider;
    modelId: string;
    taskType: AiTaskType;
    apiKeyEncrypted: string;
    apiKeyMasked: string;
    isActive: boolean;
    createdBy: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
