import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { CreateRecapJobDto } from './dto/create-recap-job.dto';
import { RecapJobsService } from './recap-jobs.service';
import { RecapScriptsService } from './recap-scripts.service';

interface AuthedRequest {
  user: { userId: string; email: string };
}

@Controller('projects/:projectId')
@UseGuards(JwtAuthGuard)
export class RecapController {
  constructor(
    private readonly recapJobsService: RecapJobsService,
    private readonly recapScriptsService: RecapScriptsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post('recap-jobs')
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateRecapJobDto,
    @Req() req: AuthedRequest,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.recapJobsService.createJob(
      projectId,
      dto.pageIds,
      req.user.userId,
    );
  }

  @Get('recap-jobs')
  async findAll(
    @Param('projectId') projectId: string,
    @Req() req: AuthedRequest,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.recapJobsService.findAllByProject(projectId);
  }

  @Get('recap-jobs/:jobId')
  async findOne(
    @Param('projectId') projectId: string,
    @Param('jobId') jobId: string,
    @Req() req: AuthedRequest,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.recapJobsService.findOne(jobId);
  }

  @Get('recap-scripts/:scriptId')
  async findScript(
    @Param('projectId') projectId: string,
    @Param('scriptId') scriptId: string,
    @Req() req: AuthedRequest,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.recapScriptsService.findOne(scriptId);
  }
}
