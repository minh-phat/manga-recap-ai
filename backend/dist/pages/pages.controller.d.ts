import { ProjectsService } from '../projects/projects.service';
import { PagesService } from './pages.service';
interface AuthedRequest {
    user: {
        userId: string;
        email: string;
    };
}
export declare class PagesController {
    private readonly pagesService;
    private readonly projectsService;
    constructor(pagesService: PagesService, projectsService: ProjectsService);
    findAll(projectId: string, req: AuthedRequest): Promise<import("./page.entity").Page[]>;
    create(projectId: string, req: AuthedRequest, file: Express.Multer.File): Promise<import("./page.entity").Page>;
    remove(projectId: string, pageId: string, req: AuthedRequest): Promise<void>;
}
export {};
