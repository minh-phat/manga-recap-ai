import { Db } from 'mongodb';
import { Project } from './project.entity';
export declare class ProjectsService {
    private readonly db;
    private readonly collection;
    constructor(db: Db);
    create(name: string, ownerId: string): Promise<Project>;
    findAllByOwner(ownerId: string): Promise<Project[]>;
}
