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
exports.CreateAiModelConfigDto = void 0;
const class_validator_1 = require("class-validator");
const PROVIDERS = ['openrouter', 'gemini', 'anthropic', 'local'];
const TASK_TYPES = ['panel_detection', 'narration'];
class CreateAiModelConfigDto {
    label;
    provider;
    modelId;
    taskType;
    apiKey;
}
exports.CreateAiModelConfigDto = CreateAiModelConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateAiModelConfigDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsIn)(PROVIDERS),
    __metadata("design:type", String)
], CreateAiModelConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateAiModelConfigDto.prototype, "modelId", void 0);
__decorate([
    (0, class_validator_1.IsIn)(TASK_TYPES),
    __metadata("design:type", String)
], CreateAiModelConfigDto.prototype, "taskType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateAiModelConfigDto.prototype, "apiKey", void 0);
//# sourceMappingURL=create-ai-model-config.dto.js.map