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
var PagesService_1;
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
let PagesService = PagesService_1 = class PagesService {
    db;
    r2;
    configService;
    logger = new common_1.Logger(PagesService_1.name);
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
    findById(id) {
        return this.collection.findOne({ _id: new mongodb_1.ObjectId(id) });
    }
    async createMany(projectId, files) {
        const startIndex = await this.collection.countDocuments({
            projectId: new mongodb_1.ObjectId(projectId),
        });
        const publicUrl = (this.configService.get('R2_PUBLIC_URL') ?? '').replace(/\/$/, '');
        const pages = await Promise.all(files.map(async (file, i) => {
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
            return {
                projectId: new mongodb_1.ObjectId(projectId),
                pageIndex: startIndex + i + 1,
                imageUrl: `${publicUrl}/${key}`,
                width,
                height,
                panelCount: 0,
                status: 'uploaded',
                createdAt: new Date(),
            };
        }));
        const result = await this.collection.insertMany(pages);
        return pages.map((page, i) => ({
            ...page,
            _id: result.insertedIds[i],
        }));
    }
    async reorder(projectId, pageIds) {
        const existingPages = await this.collection
            .find({ projectId: new mongodb_1.ObjectId(projectId) })
            .toArray();
        const existingIds = new Set(existingPages.map((p) => p._id.toString()));
        const requestedIds = new Set(pageIds);
        if (existingIds.size !== requestedIds.size ||
            pageIds.some((id) => !existingIds.has(id))) {
            throw new common_1.BadRequestException('pageIds must match exactly the existing pages of this project');
        }
        await this.collection.bulkWrite(pageIds.map((id, idx) => ({
            updateOne: {
                filter: { _id: new mongodb_1.ObjectId(id), projectId: new mongodb_1.ObjectId(projectId) },
                update: { $set: { pageIndex: idx + 1 } },
            },
        })));
        return this.findAllByProject(projectId);
    }
    async remove(projectId, pageId) {
        const page = await this.collection.findOne({
            _id: new mongodb_1.ObjectId(pageId),
            projectId: new mongodb_1.ObjectId(projectId),
        });
        if (!page) {
            throw new common_1.NotFoundException('Page not found');
        }
        const publicUrl = (this.configService.get('R2_PUBLIC_URL') ?? '').replace(/\/$/, '');
        if (publicUrl && page.imageUrl.startsWith(`${publicUrl}/`)) {
            const key = page.imageUrl.slice(publicUrl.length + 1);
            try {
                await this.r2.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: this.configService.get('R2_BUCKET_NAME'),
                    Key: key,
                }));
            }
            catch (error) {
                this.logger.error(`Failed to delete R2 object ${key}`, error);
            }
        }
        await this.db.collection('panels').deleteMany({ pageId: page._id });
        await this.collection.deleteOne({ _id: page._id });
    }
};
exports.PagesService = PagesService;
exports.PagesService = PagesService = PagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_providers_1.MONGO_DB)),
    __param(1, (0, common_1.Inject)(r2_providers_1.R2_CLIENT)),
    __metadata("design:paramtypes", [mongodb_1.Db,
        client_s3_1.S3Client,
        config_1.ConfigService])
], PagesService);
//# sourceMappingURL=pages.service.js.map