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
exports.AiModelConfigsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongodb_1 = require("mongodb");
const database_providers_1 = require("../database/database.providers");
const crypto_util_1 = require("./crypto.util");
let AiModelConfigsService = class AiModelConfigsService {
    db;
    configService;
    collection;
    constructor(db, configService) {
        this.db = db;
        this.configService = configService;
        this.collection = this.db.collection('aiModelConfigs');
    }
    get encryptionSecret() {
        return (this.configService.get('AI_KEY_ENCRYPTION_SECRET') ?? 'change-me');
    }
    findAll(taskType) {
        const filter = taskType ? { taskType } : {};
        return this.collection.find(filter).sort({ createdAt: -1 }).toArray();
    }
    async findOne(id) {
        const config = await this.collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!config) {
            throw new common_1.NotFoundException('AI model config not found');
        }
        return config;
    }
    async getActive(taskType) {
        const config = await this.collection.findOne({ taskType, isActive: true });
        if (!config) {
            throw new common_1.NotFoundException(`No active AI model configured for task "${taskType}"`);
        }
        return config;
    }
    getDecryptedApiKey(config) {
        return (0, crypto_util_1.decryptApiKey)(config.apiKeyEncrypted, this.encryptionSecret);
    }
    async create(dto, createdBy) {
        const now = new Date();
        const config = {
            label: dto.label,
            provider: dto.provider,
            modelId: dto.modelId,
            taskType: dto.taskType,
            apiKeyEncrypted: (0, crypto_util_1.encryptApiKey)(dto.apiKey, this.encryptionSecret),
            apiKeyMasked: (0, crypto_util_1.maskApiKey)(dto.apiKey),
            isActive: false,
            createdBy: new mongodb_1.ObjectId(createdBy),
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.collection.insertOne(config);
        return { ...config, _id: result.insertedId };
    }
    async update(id, dto) {
        const update = { updatedAt: new Date() };
        if (dto.label !== undefined)
            update.label = dto.label;
        if (dto.modelId !== undefined)
            update.modelId = dto.modelId;
        if (dto.apiKey !== undefined) {
            update.apiKeyEncrypted = (0, crypto_util_1.encryptApiKey)(dto.apiKey, this.encryptionSecret);
            update.apiKeyMasked = (0, crypto_util_1.maskApiKey)(dto.apiKey);
        }
        const result = await this.collection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(id) }, { $set: update }, { returnDocument: 'after' });
        if (!result) {
            throw new common_1.NotFoundException('AI model config not found');
        }
        return result;
    }
    async remove(id) {
        const result = await this.collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('AI model config not found');
        }
    }
    async activate(id) {
        const config = await this.findOne(id);
        await this.collection.updateMany({ taskType: config.taskType }, { $set: { isActive: false, updatedAt: new Date() } });
        await this.collection.updateOne({ _id: config._id }, { $set: { isActive: true, updatedAt: new Date() } });
        return this.findOne(id);
    }
};
exports.AiModelConfigsService = AiModelConfigsService;
exports.AiModelConfigsService = AiModelConfigsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_providers_1.MONGO_DB)),
    __metadata("design:paramtypes", [mongodb_1.Db,
        config_1.ConfigService])
], AiModelConfigsService);
//# sourceMappingURL=ai-model-configs.service.js.map