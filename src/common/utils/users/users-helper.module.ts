import { Module } from '@nestjs/common'
import { UsersHelperService } from './users-helper.service'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../../../app/modules/users/schemas/user.model'
import { BlogsHelperModule } from '../blogs/blogs-helper.module'
import { Comment, CommmentSchema } from '../../../app/modules/comments/schemas/comments.model'

@Module({
  imports: [
    BlogsHelperModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommmentSchema },
    ]),
  ],
  providers: [UsersHelperService],
  exports: [UsersHelperService],
})
export class UsersHelperModule {}
