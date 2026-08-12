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
exports.PagesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const mongodb_1 = require("mongodb");
const image_size_1 = require("image-size");
const uuid_1 = require("uuid");
const database_providers_1 = require("../database/database.providers");
const r2_providers_1 = require("../storage/r2.providers");
let PagesService = class PagesService {
    db;
    r2;
    configService;
    collection;
    constructor(db, r2, configService) {
        this.db = db;
        this.r2 = r2;
        this.configService = configService;
        this.collection = this.db.collection('pages');
    }
    findAllByProject(projectId) {
        return this.collection
            .find({ projectId: new mongodb_1.ObjectId(projectId) })
            .sort({ pageIndex: 1 })
            .toArray();
    }
    async create(projectId, file) {
        const nextIndex = await this.collection.countDocuments({
            projectId: new mongodb_1.ObjectId(projectId),
        });
        let width = 0;
        let height = 0;
        try {
            const dimensions = (0, image_size_1.imageSize)(file.buffer);
            width = dimensions.width;
            height = dimensions.height;
        }
        catch {
        }
        const extension = file.originalname.includes('.')
            ? file.originalname.split('.').pop()
            : 'jpg';
        const key = `projects/${projectId}/pages/${(0, uuid_1.v4)()}.${extension}`;
        await this.r2.send(new client_s3_1.PutObjectCommand({
            Bucket: this.configService.get('R2_BUCKET_NAME'),
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        const publicUrl = this.configService.get('R2_PUBLIC_URL') ?? '';
        const page = {
            projectId: new mongodb_1.ObjectId(projectId),
            pageIndex: nextIndex + 1,
            imageUrl: `${publicUrl.replace(/\/$/, '')}/${key}`,
            width,
            height,
            panelCount: 0,
            status: 'uploaded',
            createdAt: new Date(),
        };
        const result = await this.collection.insertOne(page);
        return { ...page, _id: result.insertedId };
    }
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_providers_1.MONGO_DB)),
    __param(1, (0, common_1.Inject)(r2_providers_1.R2_CLIENT)),
    __metadata("design:paramtypes", [mongodb_1.Db,
        client_s3_1.S3Client,
        config_1.ConfigService])
], PagesService);
//# sourceMappingURL=pages.service.js.map