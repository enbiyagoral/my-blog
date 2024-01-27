import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import {
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
} from '@nestjs/swagger'
import { CategoryService } from './category.service'
import { CreateCategory } from './dto/create-category.dto'
import { Category } from './schemas/category.model'

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiResponse({ status: 200, description: 'List of all categories', type: [Category] })
  @Get()
  async getAllCategory() {
    return await this.categoryService.getAllCategory()
  }

  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully', type: Category })
  @Get(':slug')
  async getCategoryById(@Param('slug') slug: string) {
    return await this.categoryService.getCategoryById(slug)
  }

  @ApiBody({ type: CreateCategory })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: Category })
  @Post()
  async createCategory(@Body() createCategory: CreateCategory) {
    return await this.categoryService.createCategory(createCategory)
  }

  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiBody({ type: CreateCategory })
  @Put(':slug')
  async updateCategory(@Param('slug') slug: string, @Body() createCategory: CreateCategory) {
    return await this.categoryService.updateCategoryById(slug, createCategory)
  }

  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @Delete(':slug')
  async deleteCategory(@Param('slug') slug: string) {
    return await this.categoryService.deleteCategoryById(slug)
  }
}
