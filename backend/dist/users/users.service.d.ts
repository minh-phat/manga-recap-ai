import { Db } from 'mongodb';
import { User } from './user.entity';
export declare class UsersService {
    private readonly db;
    private readonly collection;
    constructor(db: Db);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(user: Omit<User, '_id'>): Promise<User>;
}
