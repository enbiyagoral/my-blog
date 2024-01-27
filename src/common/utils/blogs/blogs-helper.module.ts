import { Module } from '@nestjs/common'
import { BlogsHelperService } from './blogs-helper.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Blog, BlogSchema } from '../../../app/modules/blogs/schemas/blogs.model'

@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }])],
  providers: [BlogsHelperService],
  exports: [BlogsHelperService],
})
export class BlogsHelperModule {}
