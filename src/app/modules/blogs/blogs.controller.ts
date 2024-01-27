import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { CreateBlogDto, UpdateBlogDto } from './dto/index'
import { BlogsService } from './blogs.service'
import { AuthGuard } from '../auth/guards/auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { FileInterceptor } from '@nestjs/platform-express'

@ApiBearerAuth()
@ApiTags('Blogs')
// @UseGuards(AuthGuard)
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBlogDto })
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('blog-photo'))
  async createBlogs(
    @CurrentUser() userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() createBlogDto: CreateBlogDto,
  ) {
    return await this.blogsService.create(userId, createBlogDto, file)
  }

  @ApiParam({ name: 'slug', description: 'Blog ID' })
  @ApiResponse({ status: 200, description: 'Blog retrieved successfully' })
  @Get(':slug')
  async getBlogById(@Param('slug') slug: string) {
    return await this.blogsService.getBlogById(slug)
  }

  @ApiParam({ name: 'id', description: 'Blog ID' })
  @ApiBody({ type: UpdateBlogDto })
  @ApiResponse({ status: 200, description: 'Blog updated successfully' })
  @Put(':slug')
  async updateBlogById(@Param('slug') slug: string, @Body() updateBlogDto: UpdateBlogDto) {
    return await this.blogsService.updateBlogById(slug, updateBlogDto)
  }

  @ApiParam({ name: 'slug', description: 'Blog Slug' })
  @UseGuards(AuthGuard)
  @Patch(':slug/like')
  async likeToBlog(@CurrentUser() currentUser: string, @Param('slug') slug: string) {
    return await this.blogsService.liketoBlog(slug, currentUser)
  }

  @ApiParam({ name: 'slug', description: 'Blog Slug' })
  @UseGuards(AuthGuard)
  @Patch(':slug/unlike')
  async unlikeToBlog(@CurrentUser() currentUser: string, @Param('slug') slug: string) {
    return await this.blogsService.unliketoBlog(slug, currentUser)
  }

  @UseGuards(AuthGuard)
  @ApiParam({ name: 'slug', description: 'Blog Slug' })
  @Patch(':slug/save')
  async saveToBlog(@CurrentUser() currentUser: string, @Param('slug') slug: string) {
    return await this.blogsService.savetoBlog(slug, currentUser)
  }

  @UseGuards(AuthGuard)
  @ApiParam({ name: 'slug', description: 'Blog Slug' })
  @Patch(':slug/unsave')
  async unsaveToBlog(@CurrentUser() currentUser: string, @Param('slug') slug: string) {
    return await this.blogsService.unsavetoBlog(slug, currentUser)
  }

  @ApiParam({ name: 'slug', description: 'Blog Slug' })
  @Delete(':slug')
  async deleteBlogById(@Param('slug') slug: string) {
    return await this.blogsService.deleteBlogById(slug)
  }
}
