import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { PanelsService } from './panels.service';

interface AuthedRequest {
  user: { userId: string; email: string };
}

@Controller('projects/:projectId/pages/:pageId/panels')
@UseGuards(JwtAuthGuard)
export class PanelsController {
  constructor(
    private readonly panelsService: PanelsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string,
    @Req() req: AuthedRequest,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.panelsService.findAllByPage(pageId);
  }
}
