import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

export const R2_CLIENT = 'R2_CLIENT';

export const r2Providers: Provider[] = [
  {
    provide: R2_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): S3Client => {
      const accountId = configService.get<string>('R2_ACCOUNT_ID');
      return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: configService.get<string>('R2_ACCESS_KEY_ID') ?? '',
          secretAccessKey:
            configService.get<string>('R2_SECRET_ACCESS_KEY') ?? '',
        },
      });
    },
  },
];
