import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersModule } from './users/users.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { MailModule } from './mail/mail.module'
import { BlogsModule } from './blogs/blogs.module'
import { CommentsModule } from './comments/comments.module'
import { AwsModule } from './aws/aws.module'
import { RedisModule } from './redis/redis.module'
import configuration from '../../config/configuration'
import { CategoryModule } from './category/category.module'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor'
import { UsersHelperModule } from '../../common/utils/users/users-helper.module'
import { BlogsHelperModule } from '../../common/utils/blogs/blogs-helper.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { RateLimitMiddleware } from '../../common/middlewares/rate-limit.middleware'
import { BlogsController } from './blogs/blogs.controller'
import { DashboardModule } from './dashboard/dashboard.module'
import { SearchModule } from './search/search.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongoUri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 15,
      },
    ]),
    UsersModule,
    AuthModule,
    MailModule,
    BlogsModule,
    BlogsHelperModule,
    CommentsModule,
    AwsModule,
    RedisModule,
    CategoryModule,
    UsersHelperModule,
    DashboardModule,
    SearchModule,
  ],
  controllers: [],
  providers: [
    RateLimitMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes(BlogsController)
  }
}
