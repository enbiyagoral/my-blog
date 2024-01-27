import { Controller, Get, UseGuards } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard'
import { CurrentUser } from 'src/app/modules/auth/decorators/current-user.decorator'

@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getHomePage(@CurrentUser() currentUserId: string) {
    return this.dashboardService.getHomePage(currentUserId)
  }

  @Get('/most-like')
  getMostLikedBlogs(@CurrentUser() currentUserId: string) {
    return this.dashboardService.getMostLikedBlogs(currentUserId)
  }

  @Get('/most-saved')
  getMostSavedBlogs(@CurrentUser() currentUserId: string) {
    return this.dashboardService.getMostSavedBlogs(currentUserId)
  }
}
