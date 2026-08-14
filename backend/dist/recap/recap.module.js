"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecapModule = void 0;
const common_1 = require("@nestjs/common");
const projects_module_1 = require("../projects/projects.module");
const pages_module_1 = require("../pages/pages.module");
const panels_module_1 = require("../panels/panels.module");
const ai_providers_module_1 = require("../ai-providers/ai-providers.module");
const recap_controller_1 = require("./recap.controller");
const recap_jobs_service_1 = require("./recap-jobs.service");
const recap_scripts_service_1 = require("./recap-scripts.service");
let RecapModule = class RecapModule {
};
exports.RecapModule = RecapModule;
exports.RecapModule = RecapModule = __decorate([
    (0, common_1.Module)({
        imports: [projects_module_1.ProjectsModule, pages_module_1.PagesModule, panels_module_1.PanelsModule, ai_providers_module_1.AiProvidersModule],
        controllers: [recap_controller_1.RecapController],
        providers: [recap_jobs_service_1.RecapJobsService, recap_scripts_service_1.RecapScriptsService],
    })
], RecapModule);
//# sourceMappingURL=recap.module.js.map