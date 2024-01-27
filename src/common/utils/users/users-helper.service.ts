import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, UpdateQuery } from 'mongoose'
import { SignUpDto } from 'src/app/modules/auth/dto/sign-up.dto'
import { User, UserDocument } from '../../../app/modules/users/schemas/user.model'
import { BlogsHelperService } from '../blogs/blogs-helper.service'
import { Comment } from '../../../app/modules/comments/schemas/comments.model'

@Injectable()
export class UsersHelperService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,

    private readonly blogsHelperService: BlogsHelperService,
  ) {}

  async create(signUpDto: SignUpDto): Promise<UserDocument> {
    const result = this.userModel.create(signUpDto)
    return result
  }

  async findOne(filter: FilterQuery<User>): Promise<UserDocument> {
    const result = await this.userModel.findOne(filter)
    return result
  }

  async findOneSelectPassword(filter: FilterQuery<User>): Promise<UserDocument> {
    const result = await this.userModel.findOne(filter).select('+password')
    return result
  }

  async updateOne(userId: string, updateFields: UpdateQuery<User>): Promise<UserDocument> {
    const result = await this.userModel.findByIdAndUpdate(userId, updateFields, {
      new: true,
    })

    return result
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id)

    const updateQuery = {
      $or: [{ followers: id }, { following: id }],
    }

    const updateFields = {
      $pull: {
        followers: id,
        following: id,
      },
    }

    await this.userModel.updateMany(updateQuery, updateFields)
    await this.blogsHelperService.deleteMany({ author: id })

    const existComments = await this.commentModel.deleteMany({ author: id }, { new: true })
    if (!existComments) {
      throw new NotFoundException('Blog not found')
    }

    return user
  }

  async getFollowingfUsers(currentUserId) {
    const users = await this.userModel.findOne({ _id: currentUserId })
    return users.following
  }
}
