"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProviderFactory = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_model_configs_service_1 = require("../ai-models/ai-model-configs.service");
const openrouter_client_1 = require("./openrouter.client");
const local_ai_client_1 = require("./local-ai.client");
let AiProviderFactory = class AiProviderFactory {
    aiModelConfigsService;
    configService;
    constructor(aiModelConfigsService, configService) {
        this.aiModelConfigsService = aiModelConfigsService;
        this.configService = configService;
    }
    async forTask(taskType) {
        const config = await this.aiModelConfigsService.getActive(taskType);
        switch (config.provider) {
            case 'openrouter': {
                const apiKey = this.aiModelConfigsService.getDecryptedApiKey(config);
                return new openrouter_client_1.OpenRouterClient(apiKey, config.modelId);
            }
            case 'local': {
                const baseUrl = this.configService.get('OLLAMA_BASE_URL') ??
                    'http://localhost:11434';
                return new local_ai_client_1.LocalAiClient(config.modelId, baseUrl);
            }
            default:
                throw new common_1.BadGatewayException(`Provider "${config.provider}" is not yet supported — only "openrouter" and "local" are implemented`);
        }
    }
};
exports.AiProviderFactory = AiProviderFactory;
exports.AiProviderFactory = AiProviderFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_model_configs_service_1.AiModelConfigsService,
        config_1.ConfigService])
], AiProviderFactory);
//# sourceMappingURL=ai-provider.factory.js.map