import { IsIn, IsString, MinLength } from 'class-validator';
import type { AiProvider, AiTaskType } from '../ai-model-config.entity';

const PROVIDERS: AiProvider[] = ['openrouter', 'gemini', 'anthropic', 'local'];
const TASK_TYPES: AiTaskType[] = ['panel_detection', 'narration'];

export class CreateAiModelConfigDto {
  @IsString()
  @MinLength(1)
  label: string;

  @IsIn(PROVIDERS)
  provider: AiProvider;

  @IsString()
  @MinLength(1)
  modelId: string;

  @IsIn(TASK_TYPES)
  taskType: AiTaskType;

  @IsString()
  @MinLength(1)
  apiKey: string;
}
