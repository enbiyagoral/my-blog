import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Comment } from './schemas/comments.model'
import { Model } from 'mongoose'
import { CreateCommentDto } from './dto/create-comments.dto'
import { BlogsHelperService } from '../../../common/utils/blogs/blogs-helper.service'

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    private readonly blogsHelperService: BlogsHelperService,
  ) {}

  async createComment(userId: string, blogId: string, createCommentDto: CreateCommentDto) {
    try {
      const existBlog = await this.blogsHelperService.findOne({ _id: blogId })

      if (!existBlog) {
        throw new NotFoundException('Blog not found')
      }

      const comment = await this.commentModel.create({
        blogId,
        author: userId,
        context: createCommentDto.context,
      })

      await existBlog.updateOne(
        {
          $push: {
            comments: comment,
          },
        },
        { new: true },
      )

      const result = await this.commentModel
        .findById(comment.id)
        .populate({
          path: 'author',
          select: ['username', 'email'],
        })
        .populate({
          path: 'blogId',
          select: ['title', 'description', 'context'],
        })

      return result
    } catch (error) {
      console.error('Error creating comment:', error)
      throw new Error('Error creating comment')
    }
  }

  async getCommentById(commentId: string) {
    try {
      const comment = await this.commentModel
        .findById(commentId)
        .populate({ path: 'author', select: ['username', 'email'] })
        .populate({ path: 'blogId', select: ['title', 'description', 'context'] })

      if (!comment) {
        throw new NotFoundException('Comment not found')
      }

      return comment
    } catch (error) {
      console.error('Error getting comment by id:', error)
      throw new Error('Error getting comment by id')
    }
  }

  async updateCommentById(userId: string, commentId: string, context: string) {
    try {
      const comment = await this.commentModel.findById(commentId)
      if (!comment) {
        throw new NotFoundException('Comment not found')
      }

      if (userId !== comment.author.toString()) {
        throw new UnauthorizedException('User is not authorized to update this comment')
      }

      const newComment = await this.commentModel.findByIdAndUpdate(commentId, { context }, { new: true })

      return newComment
    } catch (error) {
      console.error('Error updating comment by id:', error)
      throw new Error('Error updating comment by id')
    }
  }

  async deleteComment(userId: string, commentId: string) {
    try {
      const comment = await this.commentModel.findById(commentId)
      if (!comment) {
        throw new NotFoundException('Comment not found')
      }

      if (userId !== comment.author.toString()) {
        throw new UnauthorizedException('User is not authorized to delete this comment')
      }
      const blog = await this.blogsHelperService.findOne({ _id: comment.blogId.toString() })

      if (!blog) {
        throw new NotFoundException('Blog not found')
      }

      await blog
        .updateOne(
          {
            $pull: {
              comments: commentId,
            },
          },
          { new: true },
        )
        .populate('comments')

      await this.commentModel.findByIdAndDelete(commentId)

      return comment
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw new Error('Error deleting comment')
    }
  }

  async removeCommentFromUser(author: string) {
    const existComments = await this.commentModel.deleteMany({ author }, { new: true })
    if (!existComments) {
      throw new NotFoundException('Blog not found')
    }

    return existComments
  }
}
