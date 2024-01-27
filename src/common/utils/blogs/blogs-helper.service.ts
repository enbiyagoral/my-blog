import { Injectable, forwardRef } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, UpdateQuery } from 'mongoose'
import { Blog, BlogDocument } from '../../../app/modules/blogs/schemas/blogs.model'

@Injectable()
export class BlogsHelperService {
  constructor(@InjectModel(Blog.name) private readonly blogModel: Model<Blog>) {}

  async create(blog) {
    const result = await this.blogModel.create(blog)
    return result
  }

  async findOne(filter: FilterQuery<Blog>) {
    const result = await this.blogModel.findOne(filter).populate(['author', 'comments', 'category'])
    return result
  }

  async getMostBlogs(sorting: string) {
    const filter = sorting
    const result = await this.blogModel.find({}).sort({ [filter]: -1 })

    return result
  }

  async findBlogsByUserId(id: string) {
    const result = await this.blogModel.find({ author: { $in: [id] } }).sort({ createdAt: -1 })
    return result
  }

  async updateOne(userId: string, updateFields: UpdateQuery<Blog>): Promise<BlogDocument> {
    const result = await this.blogModel.findByIdAndUpdate(userId, updateFields, {
      new: true,
    })

    return result
  }

  async updateMany(query: any, update: any) {
    try {
      const result = await this.blogModel.updateMany(query, update)
      return result
    } catch (error) {
      throw new Error('Error updating documents')
    }
  }

  async deleteOne(filter: FilterQuery<Blog>): Promise<BlogDocument> {
    const result = await this.blogModel.findOneAndDelete(filter, { new: true })
    return result
  }

  async deleteMany(filter: FilterQuery<Blog>) {
    const result = await this.blogModel.deleteMany(filter, { new: true })
    return result
  }
}
