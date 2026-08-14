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
exports.RecapController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const projects_service_1 = require("../projects/projects.service");
const create_recap_job_dto_1 = require("./dto/create-recap-job.dto");
const create_recap_video_job_dto_1 = require("./dto/create-recap-video-job.dto");
const recap_jobs_service_1 = require("./recap-jobs.service");
const recap_scripts_service_1 = require("./recap-scripts.service");
const recap_video_jobs_service_1 = require("./recap-video-jobs.service");
let RecapController = class RecapController {
    recapJobsService;
    recapScriptsService;
    recapVideoJobsService;
    projectsService;
    constructor(recapJobsService, recapScriptsService, recapVideoJobsService, projectsService) {
        this.recapJobsService = recapJobsService;
        this.recapScriptsService = recapScriptsService;
        this.recapVideoJobsService = recapVideoJobsService;
        this.projectsService = projectsService;
    }
    async create(projectId, dto, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.recapJobsService.createJob(projectId, dto.pageIds, req.user.userId);
    }
    async findAll(projectId, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.recapJobsService.findAllByProject(projectId);
    }
    async findOne(projectId, jobId, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.recapJobsService.findOne(jobId);
    }
    async findScript(projectId, scriptId, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.recapScriptsService.findOne(scriptId);
    }
    async createVideoJob(projectId, scriptId, dto, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.recapVideoJobsService.createJob(projectId, scriptId, dto.includeCaptions, req.user.userId);
    }
    async findVideoJob(projectId, videoJobId, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.recapVideoJobsService.findOne(videoJobId);
    }
};
exports.RecapController = RecapController;
__decorate([
    (0, common_1.Post)('recap-jobs'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_recap_job_dto_1.CreateRecapJobDto, Object]),
    __metadata("design:returntype", Promise)
], RecapController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('recap-jobs'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecapController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('recap-jobs/:jobId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('jobId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecapController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('recap-scripts/:scriptId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('scriptId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecapController.prototype, "findScript", null);
__decorate([
    (0, common_1.Post)('recap-scripts/:scriptId/video-jobs'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('scriptId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_recap_video_job_dto_1.CreateRecapVideoJobDto, Object]),
    __metadata("design:returntype", Promise)
], RecapController.prototype, "createVideoJob", null);
__decorate([
    (0, common_1.Get)('video-jobs/:videoJobId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('videoJobId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RecapController.prototype, "findVideoJob", null);
exports.RecapController = RecapController = __decorate([
    (0, common_1.Controller)('projects/:projectId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recap_jobs_service_1.RecapJobsService,
        recap_scripts_service_1.RecapScriptsService,
        recap_video_jobs_service_1.RecapVideoJobsService,
        projects_service_1.ProjectsService])
], RecapController);
//# sourceMappingURL=recap.controller.js.map