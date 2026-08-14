import { ProjectsService } from '../projects/projects.service';
import { PanelsService } from './panels.service';
interface AuthedRequest {
    user: {
        userId: string;
        email: string;
    };
}
export declare class PanelsController {
    private readonly panelsService;
    private readonly projectsService;
    constructor(panelsService: PanelsService, projectsService: ProjectsService);
    findAll(projectId: string, pageId: string, req: AuthedRequest): Promise<import("./panel.entity").Panel[]>;
}
export {};
