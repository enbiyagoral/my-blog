import { Module } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { DashboardController } from './dashboard.controller'
import { BlogsHelperModule } from 'src/common/utils/blogs/blogs-helper.module'
import { UsersHelperModule } from 'src/common/utils/users/users-helper.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
  imports: [JwtModule, BlogsHelperModule, UsersHelperModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
