import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';
interface AuthedRequest {
    user: {
        userId: string;
        email: string;
    };
}
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(dto: CreateProjectDto, req: AuthedRequest): Promise<import("./project.entity").Project>;
    findAll(req: AuthedRequest): Promise<import("./project.entity").Project[]>;
}
export {};
