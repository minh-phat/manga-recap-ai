import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db, ObjectId } from 'mongodb';
import { MONGO_DB } from '../database/database.providers';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private readonly collection: Collection<User>;

  constructor(@Inject(MONGO_DB) private readonly db: Db) {
    this.collection = this.db.collection<User>('users');
  }

  findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email });
  }

  findById(id: string): Promise<User | null> {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(user: Omit<User, '_id'>): Promise<User> {
    const result = await this.collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }
}
