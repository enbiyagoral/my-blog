import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { RePasswordDto } from './dto/index'
import { AuthGuard } from 'src/app/modules/auth/guards/auth.guard'
import { CurrentUser } from 'src/app/modules/auth/decorators/current-user.decorator'
import { Throttle } from '@nestjs/throttler'
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: 200, description: 'User information retrieved successfully' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Get('me')
  async me(@CurrentUser() user: string) {
    return await this.usersService.me(user)
  }

  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User followed successfully' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiInternalServerErrorResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('follow/:id')
  async follow(@CurrentUser() userId: string, @Param('id') id: string) {
    return await this.usersService.follow(userId, id)
  }

  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @UseGuards(AuthGuard)
  @ApiInternalServerErrorResponse({ status: 500, description: 'Internal Server Error' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Patch('unfollow/:id')
  async unFollow(@CurrentUser() userId: string, @Param('id') id: string) {
    return await this.usersService.unFollow(userId, id)
  }

  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadRequestResponse({ status: 400, description: 'Bad request' })
  @ApiInternalServerErrorResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Post('/reset-password')
  async resetPassword(@CurrentUser() user: string, @Body() rePasswordDto: RePasswordDto) {
    return this.usersService.resetPassword(user, rePasswordDto)
  }

  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ status: 500, description: 'Internal Server Error' })
  @UseGuards(AuthGuard)
  @Delete('/delete-user')
  async deleteUser(@CurrentUser() user: string) {
    return this.usersService.deleteUser(user)
  }

  @UseGuards(AuthGuard)
  @Post('/subscribe/:id')
  async subscribe(@Param('id') id: string, @CurrentUser() currentUserId: string) {
    return this.usersService.subscribe(id, currentUserId)
  }

  @Get('/:username/likes')
  async getLikes(@Param('username') username: string) {
    return this.usersService.getLikes(username)
  }
}
