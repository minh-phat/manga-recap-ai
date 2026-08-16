import { Db } from 'mongodb';
import { PagesService } from '../pages/pages.service';
import { PanelsService } from '../panels/panels.service';
import { AiProviderFactory } from '../ai-providers/ai-provider.factory';
import { RecapJob } from './recap-job.entity';
import { RecapScriptsService } from './recap-scripts.service';
export declare class RecapJobsService {
    private readonly db;
    private readonly pagesService;
    private readonly panelsService;
    private readonly aiProviderFactory;
    private readonly recapScriptsService;
    private readonly logger;
    private readonly collection;
    constructor(db: Db, pagesService: PagesService, panelsService: PanelsService, aiProviderFactory: AiProviderFactory, recapScriptsService: RecapScriptsService);
    findAllByProject(projectId: string): Promise<RecapJob[]>;
    findOne(id: string): Promise<RecapJob>;
    createJob(projectId: string, pageIds: string[], createdBy: string, language: string): Promise<RecapJob>;
    private updateJob;
    private runJob;
}
