import { Module } from '@nestjs/common'
import { BlogsCommonService } from './blogs-common.service'
import { MongooseModule } from '@nestjs/mongoose'

import { Category, CategorySchema } from '../../app/modules/category/schemas/category.model'
import { User, UserSchema } from '../../app/modules/users/schemas/user.model'
import { Comment, CommmentSchema } from '../../app/modules/comments/schemas/comments.model'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Comment.name, schema: CommmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [BlogsCommonService],
  exports: [BlogsCommonService],
})
export class BlogsCommonModule {}
