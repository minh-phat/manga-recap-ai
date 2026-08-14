import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { StorageModule } from './storage/storage.module';
import { PagesModule } from './pages/pages.module';
import { AiModelConfigsModule } from './ai-models/ai-model-configs.module';
import { AiProvidersModule } from './ai-providers/ai-providers.module';
import { PanelsModule } from './panels/panels.module';
import { RecapModule } from './recap/recap.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    StorageModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    PagesModule,
    AiModelConfigsModule,
    AiProvidersModule,
    PanelsModule,
    RecapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
