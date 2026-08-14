import { Injectable, BadGatewayException } from '@nestjs/common';
import { AiModelConfigsService } from '../ai-models/ai-model-configs.service';
import { AiTaskType } from '../ai-models/ai-model-config.entity';
import { AiProviderStrategy } from './ai-provider.interface';
import { OpenRouterClient } from './openrouter.client';

@Injectable()
export class AiProviderFactory {
  constructor(private readonly aiModelConfigsService: AiModelConfigsService) {}

  async forTask(taskType: AiTaskType): Promise<AiProviderStrategy> {
    const config = await this.aiModelConfigsService.getActive(taskType);
    const apiKey = this.aiModelConfigsService.getDecryptedApiKey(config);

    switch (config.provider) {
      case 'openrouter':
        return new OpenRouterClient(apiKey, config.modelId);
      default:
        throw new BadGatewayException(
          `Provider "${config.provider}" is not yet supported — only "openrouter" is implemented`,
        );
    }
  }
}
