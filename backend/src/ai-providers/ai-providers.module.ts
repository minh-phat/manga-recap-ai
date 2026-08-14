import { Module } from '@nestjs/common';
import { AiModelConfigsModule } from '../ai-models/ai-model-configs.module';
import { AiProviderFactory } from './ai-provider.factory';

@Module({
  imports: [AiModelConfigsModule],
  providers: [AiProviderFactory],
  exports: [AiProviderFactory],
})
export class AiProvidersModule {}
