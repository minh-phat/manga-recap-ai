import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { r2Providers } from './r2.providers';

@Global()
@Module({
  imports: [ConfigModule],
  providers: r2Providers,
  exports: r2Providers,
})
export class StorageModule {}
