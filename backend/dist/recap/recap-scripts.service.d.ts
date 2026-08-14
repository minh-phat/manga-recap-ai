import { Db } from 'mongodb';
import { RecapScript } from './recap-script.entity';
export declare class RecapScriptsService {
    private readonly db;
    private readonly collection;
    constructor(db: Db);
    create(script: Omit<RecapScript, '_id'>): Promise<RecapScript>;
    findAllByProject(projectId: string): Promise<RecapScript[]>;
    findOne(id: string): Promise<RecapScript>;
}
