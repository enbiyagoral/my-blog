import { Module } from '@nestjs/common'
import { BlogsController } from './blogs.controller'
import { BlogsService } from './blogs.service'
import { AwsModule } from '../aws/aws.module'
import { RedisModule } from '../redis/redis.module'
import { JwtModule } from '@nestjs/jwt'
import { BlogsHelperModule } from '../../../common/utils/blogs/blogs-helper.module'
import { BlogsCommonModule } from '../../../shared/blogs/blogs-common.module'
import { MailModule } from 'src/app/modules/mail/mail.module'
import { SearchModule } from 'src/app/modules/search/search.module'

@Module({
  imports: [BlogsHelperModule, JwtModule, RedisModule, AwsModule, BlogsCommonModule, MailModule, SearchModule],
  controllers: [BlogsController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
