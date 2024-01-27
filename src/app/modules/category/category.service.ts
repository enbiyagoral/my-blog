import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Category } from './schemas/category.model'
import { Model, UpdateQuery } from 'mongoose'
import { CreateCategory } from './dto/create-category.dto'
import { BlogsHelperService } from '../../../common/utils/blogs/blogs-helper.service'

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    private blogsHelperService: BlogsHelperService,
  ) {}
  async getAllCategory() {
    try {
      const categories = await this.categoryModel.find({})
      return categories
    } catch (error) {
      console.error('Error getting all categories:', error)
      throw new Error('Error getting all categories')
    }
  }

  async createCategory(createCategory: CreateCategory) {
    try {
      const category = await this.categoryModel.create(createCategory)
      return category
    } catch (error) {
      console.error('Error creating category:', error)
      throw new Error('Error creating category')
    }
  }

  async getCategoryById(slug: string) {
    const category = await this.categoryModel.findOne({ slug })
    if (!category) {
      throw new NotFoundException()
    }
    return category
  }

  async updateCategoryById(slug: string, createCategory: CreateCategory) {
    try {
      const category = await this.categoryModel.findOne({ slug })
      if (!category) {
        throw new NotFoundException()
      }

      const newCategory = await this.categoryModel.findByIdAndUpdate(
        category.id,
        { name: createCategory.name },
        { new: true },
      )

      return newCategory
    } catch (error) {
      console.error('Error updating category by id:', error)
      throw new Error('Error updating category by id')
    }
  }

  async deleteCategoryById(slug: string) {
    try {
      const category = await this.categoryModel.findOne({ slug })

      if (category) {
        const updateQuery = { category: category.id }
        const updateFields = { $set: { category: null } }

        const updateResult = await this.blogsHelperService.updateMany(updateQuery, updateFields)
        const deletedCategory = await this.categoryModel.findByIdAndDelete(category.id)

        if (!deletedCategory) {
          throw new NotFoundException()
        }

        return deletedCategory
      } else {
        throw new NotFoundException('Category not found')
      }
    } catch (error) {
      console.error('Error deleting category by id:', error)
      throw new Error('Error deleting category by id')
    }
  }

  async removeBlogFromCategory(categoryId: string, blogId: string) {
    try {
      const category = await this.categoryModel.findByIdAndUpdate(categoryId, {
        $pull: {
          blogs: blogId,
        },
      })

      if (!category) {
        throw new NotFoundException()
      }

      return 'Blog Kategoriden silindi!'
    } catch (error) {}
  }
}
