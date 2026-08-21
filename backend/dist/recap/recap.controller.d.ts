import { ProjectsService } from '../projects/projects.service';
import { CreateRecapJobDto } from './dto/create-recap-job.dto';
import { CreateRecapVideoJobDto } from './dto/create-recap-video-job.dto';
import { UpdateRecapScriptEntryDto } from './dto/update-recap-script-entry.dto';
import { RecapJobsService } from './recap-jobs.service';
import { RecapScriptsService } from './recap-scripts.service';
import { RecapVideoJobsService } from './recap-video-jobs.service';
interface AuthedRequest {
    user: {
        userId: string;
        email: string;
    };
}
export declare class RecapController {
    private readonly recapJobsService;
    private readonly recapScriptsService;
    private readonly recapVideoJobsService;
    private readonly projectsService;
    constructor(recapJobsService: RecapJobsService, recapScriptsService: RecapScriptsService, recapVideoJobsService: RecapVideoJobsService, projectsService: ProjectsService);
    create(projectId: string, dto: CreateRecapJobDto, req: AuthedRequest): Promise<import("./recap-job.entity").RecapJob>;
    findAll(projectId: string, req: AuthedRequest): Promise<import("./recap-job.entity").RecapJob[]>;
    findOne(projectId: string, jobId: string, req: AuthedRequest): Promise<import("./recap-job.entity").RecapJob>;
    findScript(projectId: string, scriptId: string, req: AuthedRequest): Promise<import("./recap-script.entity").RecapScript>;
    updateScriptEntry(projectId: string, scriptId: string, panelId: string, dto: UpdateRecapScriptEntryDto, req: AuthedRequest): Promise<import("./recap-script.entity").RecapScript>;
    createVideoJob(projectId: string, scriptId: string, dto: CreateRecapVideoJobDto, req: AuthedRequest): Promise<import("./recap-video-job.entity").RecapVideoJob>;
    findVideoJobs(projectId: string, scriptId: string, req: AuthedRequest): Promise<import("./recap-video-job.entity").RecapVideoJob[]>;
    findVideoJob(projectId: string, videoJobId: string, req: AuthedRequest): Promise<import("./recap-video-job.entity").RecapVideoJob>;
}
export {};
