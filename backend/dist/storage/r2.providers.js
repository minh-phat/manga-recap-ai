"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.r2Providers = exports.R2_CLIENT = void 0;
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
exports.R2_CLIENT = 'R2_CLIENT';
exports.r2Providers = [
    {
        provide: exports.R2_CLIENT,
        inject: [config_1.ConfigService],
        useFactory: (configService) => {
            const accountId = configService.get('R2_ACCOUNT_ID');
            return new client_s3_1.S3Client({
                region: 'auto',
                endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: configService.get('R2_ACCESS_KEY_ID') ?? '',
                    secretAccessKey: configService.get('R2_SECRET_ACCESS_KEY') ?? '',
                },
            });
        },
    },
];
//# sourceMappingURL=r2.providers.js.map