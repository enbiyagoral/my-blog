import { Module } from '@nestjs/common'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Comment, CommmentSchema } from './schemas/comments.model'
import { JwtModule } from '@nestjs/jwt'
import { BlogsHelperModule } from '../../../common/utils/blogs/blogs-helper.module'

@Module({
  imports: [JwtModule, MongooseModule.forFeature([{ name: Comment.name, schema: CommmentSchema }]), BlogsHelperModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
