import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModelConfigsService } from '../ai-models/ai-model-configs.service';
import { AiTaskType } from '../ai-models/ai-model-config.entity';
import { AiProviderStrategy } from './ai-provider.interface';
import { OpenRouterClient } from './openrouter.client';
import { LocalAiClient } from './local-ai.client';

@Injectable()
export class AiProviderFactory {
  constructor(
    private readonly aiModelConfigsService: AiModelConfigsService,
    private readonly configService: ConfigService,
  ) {}

  async forTask(taskType: AiTaskType): Promise<AiProviderStrategy> {
    const config = await this.aiModelConfigsService.getActive(taskType);

    switch (config.provider) {
      case 'openrouter': {
        const apiKey = this.aiModelConfigsService.getDecryptedApiKey(config);
        return new OpenRouterClient(apiKey, config.modelId);
      }
      case 'local': {
        const baseUrl =
          this.configService.get<string>('OLLAMA_BASE_URL') ??
          'http://localhost:11434';
        return new LocalAiClient(config.modelId, baseUrl);
      }
      default:
        throw new BadGatewayException(
          `Provider "${config.provider}" is not yet supported — only "openrouter" and "local" are implemented`,
        );
    }
  }
}
