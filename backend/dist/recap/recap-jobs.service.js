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
var RecapJobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecapJobsService = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
const database_providers_1 = require("../database/database.providers");
const pages_service_1 = require("../pages/pages.service");
const panels_service_1 = require("../panels/panels.service");
const ai_provider_factory_1 = require("../ai-providers/ai-provider.factory");
const recap_scripts_service_1 = require("./recap-scripts.service");
const IMAGE_MIME_TYPE = 'image/png';
let RecapJobsService = RecapJobsService_1 = class RecapJobsService {
    db;
    pagesService;
    panelsService;
    aiProviderFactory;
    recapScriptsService;
    logger = new common_1.Logger(RecapJobsService_1.name);
    collection;
    constructor(db, pagesService, panelsService, aiProviderFactory, recapScriptsService) {
        this.db = db;
        this.pagesService = pagesService;
        this.panelsService = panelsService;
        this.aiProviderFactory = aiProviderFactory;
        this.recapScriptsService = recapScriptsService;
        this.collection = this.db.collection('recapJobs');
    }
    findAllByProject(projectId) {
        return this.collection
            .find({ projectId: new mongodb_1.ObjectId(projectId) })
            .sort({ createdAt: -1 })
            .toArray();
    }
    async findOne(id) {
        const job = await this.collection.findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!job) {
            throw new common_1.NotFoundException('Recap job not found');
        }
        return job;
    }
    async createJob(projectId, pageIds, createdBy) {
        const now = new Date();
        const job = {
            projectId: new mongodb_1.ObjectId(projectId),
            pageIds: pageIds.map((id) => new mongodb_1.ObjectId(id)),
            status: 'queued',
            createdBy: new mongodb_1.ObjectId(createdBy),
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.collection.insertOne(job);
        const created = { ...job, _id: result.insertedId };
        this.runJob(created._id.toString()).catch((error) => {
            this.logger.error(`Recap job ${created._id.toString()} failed`, error);
        });
        return created;
    }
    async updateJob(id, update) {
        await this.collection.updateOne({ _id: id }, { $set: { ...update, updatedAt: new Date() } });
    }
    async runJob(jobId) {
        const job = await this.findOne(jobId);
        const jobObjectId = job._id;
        try {
            await this.updateJob(jobObjectId, {
                status: 'running',
                currentStep: 'Đang khởi tạo...',
            });
            const panelDetectionClient = await this.aiProviderFactory.forTask('panel_detection');
            const narrationClient = await this.aiProviderFactory.forTask('narration');
            let storySoFar = '';
            const entries = [];
            let globalOrder = 1;
            for (let pageNumber = 0; pageNumber < job.pageIds.length; pageNumber += 1) {
                const pageId = job.pageIds[pageNumber];
                const page = await this.pagesService.findById(pageId.toString());
                if (!page) {
                    continue;
                }
                await this.updateJob(jobObjectId, {
                    currentStep: `Đang tách khung trang ${pageNumber + 1}/${job.pageIds.length}`,
                });
                const imageRes = await fetch(page.imageUrl);
                if (!imageRes.ok) {
                    throw new Error(`Không thể tải ảnh trang ${page.pageIndex}: ${imageRes.status}`);
                }
                const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
                const boxes = await panelDetectionClient.detectPanels({
                    imageBuffer,
                    mimeType: IMAGE_MIME_TYPE,
                });
                if (boxes.length === 0) {
                    continue;
                }
                const cropped = await this.panelsService.createFromDetections(job.projectId.toString(), pageId.toString(), imageBuffer, boxes);
                await this.updateJob(jobObjectId, {
                    currentStep: `Đang sinh nội dung trang ${pageNumber + 1}/${job.pageIds.length}`,
                });
                const narrations = await narrationClient.generateNarration({
                    panels: cropped.map(({ buffer }) => ({
                        imageBuffer: buffer,
                        mimeType: IMAGE_MIME_TYPE,
                    })),
                    storySoFar,
                    pageIndex: page.pageIndex,
                });
                for (let i = 0; i < cropped.length; i += 1) {
                    const narrationText = narrations[i] ?? '';
                    entries.push({
                        panelId: cropped[i].panel._id,
                        pageId,
                        order: globalOrder,
                        croppedImageUrl: cropped[i].panel.croppedImageUrl,
                        narrationText,
                    });
                    globalOrder += 1;
                }
                storySoFar = `${storySoFar}\n${narrations.join(' ')}`.trim();
            }
            const script = await this.recapScriptsService.create({
                projectId: job.projectId,
                jobId: jobObjectId,
                entries,
                createdAt: new Date(),
            });
            await this.updateJob(jobObjectId, {
                status: 'completed',
                currentStep: undefined,
                scriptId: script._id,
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
exports.RecapJobsService = RecapJobsService;
exports.RecapJobsService = RecapJobsService = RecapJobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_providers_1.MONGO_DB)),
    __metadata("design:paramtypes", [mongodb_1.Db,
        pages_service_1.PagesService,
        panels_service_1.PanelsService,
        ai_provider_factory_1.AiProviderFactory,
        recap_scripts_service_1.RecapScriptsService])
], RecapJobsService);
//# sourceMappingURL=recap-jobs.service.js.map