import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
} from '@nestjs/swagger'
import { CommentsService } from '../comments/comments.service'
import { CreateCommentDto } from './dto/create-comments.dto'
import { AuthGuard } from '../auth/guards/auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Comment } from './schemas/comments.model'

@ApiBearerAuth()
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment retrieved successfully', type: Comment })
  @Get(':id')
  async getCommentById(@Param('id') commentId: string) {
    return await this.commentService.getCommentById(commentId)
  }

  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, description: 'Comment created successfully', type: Comment })
  @UseGuards(AuthGuard)
  @Post(':id')
  async createComment(
    @CurrentUser() userId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Param('id') blogId: string,
  ) {
    return await this.commentService.createComment(userId, blogId, createCommentDto)
  }

  @ApiBody({ schema: { type: 'object', properties: { context: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Comment updated successfully', type: Comment })
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateComment(@CurrentUser() userId: string, @Body('context') context: string, @Param('id') commentId: string) {
    return await this.commentService.updateCommentById(userId, commentId, context)
  }

  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteComment(@CurrentUser() userId: string, @Param('id') commentId: string) {
    return await this.commentService.deleteComment(userId, commentId)
  }
}
