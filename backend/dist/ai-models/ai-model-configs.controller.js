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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModelConfigsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const ai_model_configs_service_1 = require("./ai-model-configs.service");
const create_ai_model_config_dto_1 = require("./dto/create-ai-model-config.dto");
const update_ai_model_config_dto_1 = require("./dto/update-ai-model-config.dto");
function toPublic(config) {
    const rest = { ...config };
    delete rest.apiKeyEncrypted;
    return rest;
}
let AiModelConfigsController = class AiModelConfigsController {
    aiModelConfigsService;
    constructor(aiModelConfigsService) {
        this.aiModelConfigsService = aiModelConfigsService;
    }
    async findAll(taskType) {
        const configs = await this.aiModelConfigsService.findAll(taskType);
        return configs.map(toPublic);
    }
    async create(dto, req) {
        const config = await this.aiModelConfigsService.create(dto, req.user.userId);
        return toPublic(config);
    }
    async update(id, dto) {
        const config = await this.aiModelConfigsService.update(id, dto);
        return toPublic(config);
    }
    remove(id) {
        return this.aiModelConfigsService.remove(id);
    }
    async activate(id) {
        const config = await this.aiModelConfigsService.activate(id);
        return toPublic(config);
    }
};
exports.AiModelConfigsController = AiModelConfigsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('taskType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiModelConfigsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ai_model_config_dto_1.CreateAiModelConfigDto, Object]),
    __metadata("design:returntype", Promise)
], AiModelConfigsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ai_model_config_dto_1.UpdateAiModelConfigDto]),
    __metadata("design:returntype", Promise)
], AiModelConfigsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiModelConfigsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiModelConfigsController.prototype, "activate", null);
exports.AiModelConfigsController = AiModelConfigsController = __decorate([
    (0, common_1.Controller)('ai-model-configs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [ai_model_configs_service_1.AiModelConfigsService])
], AiModelConfigsController);
//# sourceMappingURL=ai-model-configs.controller.js.map