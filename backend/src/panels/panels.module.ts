import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { PanelsController } from './panels.controller';
import { PanelsService } from './panels.service';

@Module({
  imports: [ProjectsModule],
  controllers: [PanelsController],
  providers: [PanelsService],
  exports: [PanelsService],
})
export class PanelsModule {}
