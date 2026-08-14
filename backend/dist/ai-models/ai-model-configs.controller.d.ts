import { AiModelConfigsService } from './ai-model-configs.service';
import { AiModelConfig } from './ai-model-config.entity';
import type { AiTaskType } from './ai-model-config.entity';
import { CreateAiModelConfigDto } from './dto/create-ai-model-config.dto';
import { UpdateAiModelConfigDto } from './dto/update-ai-model-config.dto';
interface AuthedRequest {
    user: {
        userId: string;
        email: string;
        role: string;
    };
}
export declare class AiModelConfigsController {
    private readonly aiModelConfigsService;
    constructor(aiModelConfigsService: AiModelConfigsService);
    findAll(taskType?: AiTaskType): Promise<Partial<AiModelConfig>[]>;
    create(dto: CreateAiModelConfigDto, req: AuthedRequest): Promise<Partial<AiModelConfig>>;
    update(id: string, dto: UpdateAiModelConfigDto): Promise<Partial<AiModelConfig>>;
    remove(id: string): Promise<void>;
    activate(id: string): Promise<Partial<AiModelConfig>>;
}
export {};
