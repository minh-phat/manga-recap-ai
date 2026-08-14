import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGO_DB } from '../database/database.providers';
import { RecapScript } from './recap-script.entity';

@Injectable()
export class RecapScriptsService {
  private readonly collection: Collection<RecapScript>;

  constructor(@Inject(MONGO_DB) private readonly db: Db) {
    this.collection = this.db.collection<RecapScript>('recapScripts');
  }

  async create(script: Omit<RecapScript, '_id'>): Promise<RecapScript> {
    const result = await this.collection.insertOne(script);
    return { ...script, _id: result.insertedId };
  }

  findAllByProject(projectId: string): Promise<RecapScript[]> {
    return this.collection
      .find({ projectId: new ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findOne(id: string): Promise<RecapScript> {
    const script = await this.collection.findOne({ _id: new ObjectId(id) });
    if (!script) {
      throw new NotFoundException('Recap script not found');
    }
    return script;
  }
}
