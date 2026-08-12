import {
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { PagesService } from './pages.service';

interface AuthedRequest {
  user: { userId: string; email: string };
}

const MAX_FILE_SIZE = 15 * 1024 * 1024;

@Controller('projects/:projectId/pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  async findAll(
    @Param('projectId') projectId: string,
    @Req() req: AuthedRequest,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.pagesService.findAllByProject(projectId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async create(
    @Param('projectId') projectId: string,
    @Req() req: AuthedRequest,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE })
        .build(),
    )
    file: Express.Multer.File,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.pagesService.create(projectId, file);
  }
}
