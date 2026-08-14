"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RecapVideoJobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecapVideoJobsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const mongodb_1 = require("mongodb");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const database_providers_1 = require("../database/database.providers");
const r2_providers_1 = require("../storage/r2.providers");
const recap_scripts_service_1 = require("./recap-scripts.service");
const duration_util_1 = require("./duration.util");
let RecapVideoJobsService = RecapVideoJobsService_1 = class RecapVideoJobsService {
    db;
    r2;
    configService;
    recapScriptsService;
    logger = new common_1.Logger(RecapVideoJobsService_1.name);
    collection;
    bundleServeUrlPromise = null;
    constructor(db, r2, configService, recapScriptsService) {
        this.db = db;
        this.r2 = r2;
        this.configService = configService;
        this.recapScriptsService = recapScriptsService;
        this.collection = this.db.collection('recapVideoJobs');
    }
    async findOne(id) {
        const job = await this.collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!job) {
            throw new common_1.NotFoundException('Recap video job not found');
        }
        return job;
    }
    async createJob(projectId, scriptId, includeCaptions, createdBy) {
        const now = new Date();
        const job = {
            projectId: new mongodb_1.ObjectId(projectId),
            scriptId: new mongodb_1.ObjectId(scriptId),
            includeCaptions,
            status: 'queued',
            createdBy: new mongodb_1.ObjectId(createdBy),
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.collection.insertOne(job);
        const created = { ...job, _id: result.insertedId };
        this.runJob(created._id.toString()).catch((error) => {
            this.logger.error(`Recap video job ${created._id.toString()} failed`, error);
        });
        return created;
    }
    async updateJob(id, update) {
        await this.collection.updateOne({ _id: id }, { $set: { ...update, updatedAt: new Date() } });
    }
    getBundleServeUrl() {
        if (!this.bundleServeUrlPromise) {
            this.bundleServeUrlPromise = (async () => {
                const { bundle } = await import('@remotion/bundler');
                return bundle({
                    entryPoint: path.join(process.cwd(), 'video-render', 'index.ts'),
                });
            })();
        }
        return this.bundleServeUrlPromise;
    }
    async runJob(jobId) {
        const job = await this.findOne(jobId);
        const jobObjectId = job._id;
        try {
            await this.updateJob(jobObjectId, {
                status: 'running',
                currentStep: 'Đang chuẩn bị dữ liệu...',
            });
            const script = await this.recapScriptsService.findOne(job.scriptId.toString());
            const entries = script.entries.map((entry) => ({
                panelId: entry.panelId.toString(),
                imageUrl: entry.croppedImageUrl,
                narrationText: entry.narrationText,
            }));
            const timings = (0, duration_util_1.computeEntryTimings)(entries.map((e) => e.narrationText), duration_util_1.VIDEO_FPS);
            const durationInFrames = (0, duration_util_1.computeTotalDurationInFrames)(timings);
            await this.updateJob(jobObjectId, {
                currentStep: 'Đang render video...',
                durationInFrames,
            });
            const { selectComposition, renderMedia } = await import('@remotion/renderer');
            const serveUrl = await this.getBundleServeUrl();
            const inputProps = { entries, includeCaptions: job.includeCaptions };
            const composition = await selectComposition({
                serveUrl,
                id: 'RecapVideo',
                inputProps,
            });
            const outputPath = path.join(os.tmpdir(), `recap-video-${jobId}.mp4`);
            await renderMedia({
                serveUrl,
                composition,
                codec: 'h264',
                outputLocation: outputPath,
                inputProps,
            });
            await this.updateJob(jobObjectId, {
                currentStep: 'Đang tải video lên...',
            });
            const buffer = fs.readFileSync(outputPath);
            const key = `projects/${job.projectId.toString()}/recap-videos/${(0, uuid_1.v4)()}.mp4`;
            await this.r2.send(new client_s3_1.PutObjectCommand({
                Bucket: this.configService.get('R2_BUCKET_NAME'),
                Key: key,
                Body: buffer,
                ContentType: 'video/mp4',
            }));
            fs.unlinkSync(outputPath);
            const publicUrl = (this.configService.get('R2_PUBLIC_URL') ?? '').replace(/\/$/, '');
            await this.updateJob(jobObjectId, {
                status: 'completed',
                currentStep: undefined,
                videoUrl: `${publicUrl}/${key}`,
                completedAt: new Date(),
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            await this.updateJob(jobObjectId, { status: 'failed', error: message });
            throw error;
        }
    }
};
exports.RecapVideoJobsService = RecapVideoJobsService;
exports.RecapVideoJobsService = RecapVideoJobsService = RecapVideoJobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_providers_1.MONGO_DB)),
    __param(1, (0, common_1.Inject)(r2_providers_1.R2_CLIENT)),
    __metadata("design:paramtypes", [mongodb_1.Db,
        client_s3_1.S3Client,
        config_1.ConfigService,
        recap_scripts_service_1.RecapScriptsService])
], RecapVideoJobsService);
//# sourceMappingURL=recap-video-jobs.service.js.map