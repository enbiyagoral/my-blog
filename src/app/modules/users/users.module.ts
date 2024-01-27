import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MailModule } from '../mail/mail.module'
import { RedisModule } from '../redis/redis.module'
import { JwtModule } from '@nestjs/jwt'
import { UsersHelperModule } from '../../../common/utils/users/users-helper.module'

@Module({
  imports: [UsersHelperModule, JwtModule, RedisModule, MailModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
