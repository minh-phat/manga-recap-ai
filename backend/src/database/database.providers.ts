import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Db, MongoClient } from 'mongodb';

export const MONGO_CLIENT = 'MONGO_CLIENT';
export const MONGO_DB = 'MONGO_DB';

export const databaseProviders: Provider[] = [
  {
    provide: MONGO_CLIENT,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<MongoClient> => {
      const uri = configService.get<string>('MONGODB_URI');
      const client = new MongoClient(uri ?? '');
      await client.connect();
      return client;
    },
  },
  {
    provide: MONGO_DB,
    inject: [MONGO_CLIENT, ConfigService],
    useFactory: (client: MongoClient, configService: ConfigService): Db => {
      const dbName = configService.get<string>('MONGODB_DB_NAME');
      return client.db(dbName);
    },
  },
];
