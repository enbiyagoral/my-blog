import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { RedisModule } from '../redis/redis.module'
import { AccessTokenStrategy } from './strategies/accessToken.strategy'
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy'
import { UsersHelperModule } from '../../../common/utils/users/users-helper.module'
import { MailModule } from '../mail/mail.module'
import { AccessContorlService } from '../../../shared/auth/access-control.service'

@Module({
  imports: [UsersHelperModule, RedisModule, MailModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy, JwtService, AccessContorlService],
  exports: [JwtService],
})
export class AuthModule {}
