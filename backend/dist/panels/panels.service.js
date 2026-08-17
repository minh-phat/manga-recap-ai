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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PanelsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const mongodb_1 = require("mongodb");
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const database_providers_1 = require("../database/database.providers");
const r2_providers_1 = require("../storage/r2.providers");
const image_cropper_util_1 = require("./image-cropper.util");
const MAX_ATTEMPTS = 3;
let PanelsService = PanelsService_1 = class PanelsService {
    db;
    r2;
    configService;
    logger = new common_1.Logger(PanelsService_1.name);
    collection;
    constructor(db, r2, configService) {
        this.db = db;
        this.r2 = r2;
        this.configService = configService;
        this.collection = this.db.collection('panels');
    }
    findAllByPage(pageId) {
        return this.collection
            .find({ pageId: new mongodb_1.ObjectId(pageId) })
            .sort({ order: 1 })
            .toArray();
    }
    async uploadCrop(projectId, pageId, buffer) {
        const publicUrl = this.configService.get('R2_PUBLIC_URL') ?? '';
        const key = `projects/${projectId}/pages/${pageId}/panels/${(0, uuid_1.v4)()}.png`;
        await this.r2.send(new client_s3_1.PutObjectCommand({
            Bucket: this.configService.get('R2_BUCKET_NAME'),
            Key: key,
            Body: buffer,
            ContentType: 'image/png',
        }));
        return `${publicUrl.replace(/\/$/, '')}/${key}`;
    }
    async createFromDetections(projectId, pageId, imageBuffer, boxes, mimeType, panelDetectionClient) {
        const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
        const imageWidth = metadata.width ?? 0;
        const imageHeight = metadata.height ?? 0;
        const results = [];
        for (let i = 0; i < boxes.length; i += 1) {
            let candidate = boxes[i];
            const attempts = [];
            let finalBuffer = null;
            let status = 'failed';
            for (let attemptNum = 1; attemptNum <= MAX_ATTEMPTS; attemptNum += 1) {
                const pixelBox = {
                    x: candidate.x * imageWidth,
                    y: candidate.y * imageHeight,
                    width: candidate.width * imageWidth,
                    height: candidate.height * imageHeight,
                };
                const bbox = (0, image_cropper_util_1.clampBoundingBox)(pixelBox, imageWidth, imageHeight);
                const croppedBuffer = await (0, image_cropper_util_1.cropRegion)(imageBuffer, bbox);
                const croppedImageUrl = await this.uploadCrop(projectId, pageId, croppedBuffer);
                attempts.push({ bbox, croppedImageUrl });
                finalBuffer = croppedBuffer;
                const valid = !(0, image_cropper_util_1.isDegenerateNormalizedBox)(candidate) && !(0, image_cropper_util_1.isDegenerateBox)(bbox);
                if (valid) {
                    status = 'ok';
                    break;
                }
                if (attemptNum < MAX_ATTEMPTS) {
                    this.logger.warn(`Panel detection degenerate box (page=${pageId} order=${i + 1} attempt=${attemptNum}): ${JSON.stringify(candidate)} -> retrying`);
                    candidate = await panelDetectionClient.redetectPanelBox({
                        imageBuffer,
                        mimeType,
                        previousBox: candidate,
                        order: i + 1,
                        totalPanels: boxes.length,
                    });
                }
                else {
                    this.logger.warn(`Panel detection still degenerate after ${MAX_ATTEMPTS} attempts (page=${pageId} order=${i + 1}) — flagging for manual review`);
                }
            }
            const lastAttempt = attempts[attempts.length - 1];
            const panel = {
                projectId: new mongodb_1.ObjectId(projectId),
                pageId: new mongodb_1.ObjectId(pageId),
                order: i + 1,
                bbox: lastAttempt.bbox,
                croppedImageUrl: lastAttempt.croppedImageUrl,
                status,
                attempts,
                createdAt: new Date(),
            };
            const result = await this.collection.insertOne(panel);
            if (status === 'ok') {
                results.push({
                    panel: { ...panel, _id: result.insertedId },
                    buffer: finalBuffer,
                });
            }
        }
        return results;
    }
};
exports.PanelsService = PanelsService;
exports.PanelsService = PanelsService = PanelsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_providers_1.MONGO_DB)),
    __param(1, (0, common_1.Inject)(r2_providers_1.R2_CLIENT)),
    __metadata("design:paramtypes", [mongodb_1.Db,
        client_s3_1.S3Client,
        config_1.ConfigService])
], PanelsService);
//# sourceMappingURL=panels.service.js.map