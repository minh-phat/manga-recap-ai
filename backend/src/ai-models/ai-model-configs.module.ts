import { Module } from '@nestjs/common';
import { AiModelConfigsController } from './ai-model-configs.controller';
import { AiModelConfigsService } from './ai-model-configs.service';

@Module({
  controllers: [AiModelConfigsController],
  providers: [AiModelConfigsService],
  exports: [AiModelConfigsService],
})
export class AiModelConfigsModule {}
