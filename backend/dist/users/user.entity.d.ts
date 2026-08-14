import { ObjectId } from 'mongodb';
export type UserRole = 'user' | 'admin';
export interface User {
    _id?: ObjectId;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    createdAt: Date;
}
