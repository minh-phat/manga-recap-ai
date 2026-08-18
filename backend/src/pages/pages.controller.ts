import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ParseFilePipeBuilder,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from '../projects/projects.service';
import { ReorderPagesDto } from './dto/reorder-pages.dto';
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
  @UseInterceptors(FilesInterceptor('files', 50, { storage: memoryStorage() }))
  async create(
    @Param('projectId') projectId: string,
    @Req() req: AuthedRequest,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ })
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE })
        .build(),
    )
    files: Express.Multer.File[],
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.pagesService.createMany(projectId, files);
  }

  @Patch('reorder')
  async reorder(
    @Param('projectId') projectId: string,
    @Req() req: AuthedRequest,
    @Body() dto: ReorderPagesDto,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    return this.pagesService.reorder(projectId, dto.pageIds);
  }

  @Delete(':pageId')
  async remove(
    @Param('projectId') projectId: string,
    @Param('pageId') pageId: string,
    @Req() req: AuthedRequest,
  ) {
    await this.projectsService.findOneByOwner(projectId, req.user.userId);
    await this.pagesService.remove(projectId, pageId);
  }
}
