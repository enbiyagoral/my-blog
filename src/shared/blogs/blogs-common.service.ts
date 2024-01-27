import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Category } from '../../app/modules/category/schemas/category.model'
import { Comment } from '../../app/modules/comments/schemas/comments.model'
import { User } from '../../app/modules/users/schemas/user.model'

@Injectable()
export class BlogsCommonService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async addBlogFromUser(id: string, blogId: string) {
    const result = await this.userModel.findByIdAndUpdate(id, {
      $push: {
        blogs: blogId,
      },
    })

    return result
  }

  async addLikedFromUser(id: string, blogId) {
    const result = await this.userModel.findByIdAndUpdate(
      id,
      {
        $push: {
          liked: blogId,
        },
      },
      { new: true },
    )

    return result
  }

  async getSubscriber(id: string) {
    const user = await this.userModel.findById(id)
    const subscriberEmails: string[] = []

    await Promise.all(
      user.subscriber.map(async (subscriberId) => {
        const subscriber = await this.userModel.findById(subscriberId.toString())
        if (subscriber) {
          subscriberEmails.push(subscriber.email)
        }
      }),
    )

    return subscriberEmails
  }

  async removeLikedFromUser(id: string, blogId) {
    const user = await this.userModel.findById(id)
    if (user.liked.includes(blogId)) {
      await user.updateOne(
        {
          $pull: {
            liked: blogId,
          },
        },
        { new: true },
      )
      return user
    }
  }

  async addSavedFromUser(id: string, blogId) {
    const result = await this.userModel.findByIdAndUpdate(
      id,
      {
        $push: {
          saved: blogId,
        },
      },
      { new: true },
    )
    return result
  }

  async removeSavedFromUser(id: string, blogId) {
    const user = await this.userModel.findById(id)
    if (user.liked.includes(blogId)) {
      await user.updateOne(
        {
          $pull: {
            saved: blogId,
          },
        },
        { new: true },
      )
      return user
    }
  }

  async getCategoryById(categoryId: string) {
    const category = await this.categoryModel.findById(categoryId)
    if (!category) {
      throw new NotFoundException()
    }
    return category
  }

  // REMOVE

  async removeCommentFromBlog(blogId: string) {
    const existBlog = await this.commentModel.deleteMany({ blogId }, { new: true })
    if (!existBlog) {
      throw new NotFoundException('Blog not found')
    }

    return existBlog
  }

  async removeUserFromBlog(id: string, blogId: string) {
    const blog = await this.userModel.findByIdAndUpdate(id, {
      $pull: {
        blogs: blogId,
      },
    })

    return blog
  }

  async removeBlogFromCategory(blogId: string, categoryId: string) {
    const category = await this.categoryModel.findByIdAndUpdate(categoryId, {
      $pull: {
        blogs: blogId,
      },
    })

    if (!category) {
      throw new NotFoundException()
    }

    return category
  }
}
