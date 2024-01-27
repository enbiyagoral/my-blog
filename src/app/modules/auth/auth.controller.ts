import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBody,
} from '@nestjs/swagger'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/sign-in.dto'
import { AuthGuard } from './guards/auth.guard'
import { UnverifiedException } from 'src/common/exceptions/unverified.exception'
import { response } from 'express'
import { CurrentUser } from './decorators/current-user.decorator'
import { SignUpDto } from './dto/sign-up.dto'
import { User } from 'src/app/modules/users/schemas/user.model'
import { ChangePasswordDto } from 'src/app/modules/users/dto'
import { RoleGuard } from './guards/role.guard'
import { Roles } from './decorators/roles.decorator'
import { Role } from './enums/role.enum'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: SignInDto })
  @Post('/login')
  signIn(@Body() signInDto: SignInDto) {
    try {
      return this.authService.signIn(signInDto.email, signInDto.password)
    } catch (error) {
      if (error instanceof UnverifiedException) {
        return response.redirect('verify-otp')
      }
    }
  }

  @ApiBody({ type: SignUpDto })
  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<User> {
    return this.authService.signUp(signUpDto)
  }

  @ApiBody({ schema: { type: 'object', properties: { otp: { type: 'string' } } } })
  @Post('/verify/:id')
  verifyOtp(@Body('otp') otp: string, @Param('id') id: string) {
    return this.authService.verifyOtp(otp, id)
  }

  @Get('/admin')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  async adminOnlyEndpoint() {
    return 'Welcome admin'
  }

  @UseGuards(AuthGuard)
  @Delete('logout/:id')
  async logOut(@Param('id') id: string, @CurrentUser() userId: string) {
    if (id == userId) {
      return await this.authService.logout(userId)
    }

    return false
  }

  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' } } } })
  @Post('/forgot-password-request')
  forgotPasswordRequest(@Body('email') email: string) {
    return this.authService.forgotPasswordRequest(email)
  }

  @ApiBody({ type: ChangePasswordDto })
  @Patch('/forgot-password/')
  forgotPassword(@Body() changePasswordDto: ChangePasswordDto, @Query('token') token: string, @Query('id') id: string) {
    return this.authService.forgotPassword(token, id, changePasswordDto)
  }
}
