import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGO_DB } from '../database/database.providers';
import { Project } from './project.entity';

@Injectable()
export class ProjectsService {
  private readonly collection: Collection<Project>;

  constructor(@Inject(MONGO_DB) private readonly db: Db) {
    this.collection = this.db.collection<Project>('projects');
  }

  async create(name: string, ownerId: string): Promise<Project> {
    const project: Omit<Project, '_id'> = {
      name,
      ownerId: new ObjectId(ownerId),
      createdAt: new Date(),
    };
    const result = await this.collection.insertOne(project);
    return { ...project, _id: result.insertedId };
  }

  findAllByOwner(ownerId: string): Promise<Project[]> {
    return this.collection
      .find({ ownerId: new ObjectId(ownerId) })
      .sort({ createdAt: -1 })
      .toArray();
  }
}
