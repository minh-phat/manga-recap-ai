import { ProjectsService } from '../projects/projects.service';
import { CreateRecapJobDto } from './dto/create-recap-job.dto';
import { RecapJobsService } from './recap-jobs.service';
import { RecapScriptsService } from './recap-scripts.service';
interface AuthedRequest {
    user: {
        userId: string;
        email: string;
    };
}
export declare class RecapController {
    private readonly recapJobsService;
    private readonly recapScriptsService;
    private readonly projectsService;
    constructor(recapJobsService: RecapJobsService, recapScriptsService: RecapScriptsService, projectsService: ProjectsService);
    create(projectId: string, dto: CreateRecapJobDto, req: AuthedRequest): Promise<import("./recap-job.entity").RecapJob>;
    findAll(projectId: string, req: AuthedRequest): Promise<import("./recap-job.entity").RecapJob[]>;
    findOne(projectId: string, jobId: string, req: AuthedRequest): Promise<import("./recap-job.entity").RecapJob>;
    findScript(projectId: string, scriptId: string, req: AuthedRequest): Promise<import("./recap-script.entity").RecapScript>;
}
export {};
