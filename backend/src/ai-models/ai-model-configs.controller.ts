import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AiModelConfigsService } from './ai-model-configs.service';
import { AiModelConfig } from './ai-model-config.entity';
import type { AiTaskType } from './ai-model-config.entity';
import { CreateAiModelConfigDto } from './dto/create-ai-model-config.dto';
import { UpdateAiModelConfigDto } from './dto/update-ai-model-config.dto';

interface AuthedRequest {
  user: { userId: string; email: string; role: string };
}

function toPublic(config: AiModelConfig) {
  const rest: Partial<AiModelConfig> = { ...config };
  delete rest.apiKeyEncrypted;
  return rest;
}

@Controller('ai-model-configs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AiModelConfigsController {
  constructor(private readonly aiModelConfigsService: AiModelConfigsService) {}

  @Get()
  async findAll(@Query('taskType') taskType?: AiTaskType) {
    const configs = await this.aiModelConfigsService.findAll(taskType);
    return configs.map(toPublic);
  }

  @Post()
  async create(@Body() dto: CreateAiModelConfigDto, @Req() req: AuthedRequest) {
    const config = await this.aiModelConfigsService.create(
      dto,
      req.user.userId,
    );
    return toPublic(config);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAiModelConfigDto) {
    const config = await this.aiModelConfigsService.update(id, dto);
    return toPublic(config);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiModelConfigsService.remove(id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    const config = await this.aiModelConfigsService.activate(id);
    return toPublic(config);
  }
}
