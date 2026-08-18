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
exports.PagesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const projects_service_1 = require("../projects/projects.service");
const reorder_pages_dto_1 = require("./dto/reorder-pages.dto");
const pages_service_1 = require("./pages.service");
const MAX_FILE_SIZE = 15 * 1024 * 1024;
let PagesController = class PagesController {
    pagesService;
    projectsService;
    constructor(pagesService, projectsService) {
        this.pagesService = pagesService;
        this.projectsService = projectsService;
    }
    async findAll(projectId, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.pagesService.findAllByProject(projectId);
    }
    async create(projectId, req, files) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.pagesService.createMany(projectId, files);
    }
    async reorder(projectId, req, dto) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        return this.pagesService.reorder(projectId, dto.pageIds);
    }
    async remove(projectId, pageId, req) {
        await this.projectsService.findOneByOwner(projectId, req.user.userId);
        await this.pagesService.remove(projectId, pageId);
    }
};
exports.PagesController = PagesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 50, { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFiles)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE })
        .build())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, reorder_pages_dto_1.ReorderPagesDto]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Delete)(':pageId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('pageId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PagesController.prototype, "remove", null);
exports.PagesController = PagesController = __decorate([
    (0, common_1.Controller)('projects/:projectId/pages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pages_service_1.PagesService,
        projects_service_1.ProjectsService])
], PagesController);
//# sourceMappingURL=pages.controller.js.map