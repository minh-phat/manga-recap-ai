"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModelConfigsModule = void 0;
const common_1 = require("@nestjs/common");
const ai_model_configs_controller_1 = require("./ai-model-configs.controller");
const ai_model_configs_service_1 = require("./ai-model-configs.service");
let AiModelConfigsModule = class AiModelConfigsModule {
};
exports.AiModelConfigsModule = AiModelConfigsModule;
exports.AiModelConfigsModule = AiModelConfigsModule = __decorate([
    (0, common_1.Module)({
        controllers: [ai_model_configs_controller_1.AiModelConfigsController],
        providers: [ai_model_configs_service_1.AiModelConfigsService],
        exports: [ai_model_configs_service_1.AiModelConfigsService],
    })
], AiModelConfigsModule);
//# sourceMappingURL=ai-model-configs.module.js.map