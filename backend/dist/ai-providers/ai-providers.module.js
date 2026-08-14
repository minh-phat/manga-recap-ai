"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProvidersModule = void 0;
const common_1 = require("@nestjs/common");
const ai_model_configs_module_1 = require("../ai-models/ai-model-configs.module");
const ai_provider_factory_1 = require("./ai-provider.factory");
let AiProvidersModule = class AiProvidersModule {
};
exports.AiProvidersModule = AiProvidersModule;
exports.AiProvidersModule = AiProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [ai_model_configs_module_1.AiModelConfigsModule],
        providers: [ai_provider_factory_1.AiProviderFactory],
        exports: [ai_provider_factory_1.AiProviderFactory],
    })
], AiProvidersModule);
//# sourceMappingURL=ai-providers.module.js.map