import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { PagesModule } from '../pages/pages.module';
import { PanelsModule } from '../panels/panels.module';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { RecapController } from './recap.controller';
import { RecapJobsService } from './recap-jobs.service';
import { RecapScriptsService } from './recap-scripts.service';

@Module({
  imports: [ProjectsModule, PagesModule, PanelsModule, AiProvidersModule],
  controllers: [RecapController],
  providers: [RecapJobsService, RecapScriptsService],
})
export class RecapModule {}
