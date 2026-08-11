"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseProviders = exports.MONGO_DB = exports.MONGO_CLIENT = void 0;
const config_1 = require("@nestjs/config");
const mongodb_1 = require("mongodb");
exports.MONGO_CLIENT = 'MONGO_CLIENT';
exports.MONGO_DB = 'MONGO_DB';
exports.databaseProviders = [
    {
        provide: exports.MONGO_CLIENT,
        inject: [config_1.ConfigService],
        useFactory: async (configService) => {
            const uri = configService.get('MONGODB_URI');
            const client = new mongodb_1.MongoClient(uri ?? '');
            await client.connect();
            return client;
        },
    },
    {
        provide: exports.MONGO_DB,
        inject: [exports.MONGO_CLIENT, config_1.ConfigService],
        useFactory: (client, configService) => {
            const dbName = configService.get('MONGODB_DB_NAME');
            return client.db(dbName);
        },
    },
];
//# sourceMappingURL=database.providers.js.map