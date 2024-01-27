import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { RedisService } from 'src/app/modules/redis/redis.service'
import { UsersHelperService } from '../../../common/utils/users/users-helper.service'
import { User } from '../../../app/modules/users/schemas/user.model'
import { SignUpDto } from './dto/sign-up.dto'
import * as otpGenerator from 'otp-generator'
import { MailService } from '../../../app/modules/mail/mail.service'
import { ChangePasswordDto } from 'src/app/modules/users/dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersHelperService: UsersHelperService,
    private jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersHelperService.findOneSelectPassword({ email })
    const validatePass = await bcrypt.compare(pass, user.password)

    if (user.isVerified !== true) {
      return false
    }

    if (user && validatePass && user.isVerified) {
      const userId = await this.usersHelperService.findOne({ email: user.email })
      console.log(user.role[0], 'sdfsdf')
      const data = await this.getTokens(userId._id.toString(), user.role[0])

      await this.redisService.hSetToken(userId._id.toString(), JSON.stringify(data))
      return data
    } else {
      return 'şifre yanlış'
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<User> {
    const { username, email, birthdate, password } = signUpDto
    const saltOrRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltOrRounds)

    const otpCode = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    })

    const user = await this.usersHelperService.create({ username, email, password: hashedPassword, birthdate })

    await this.redisService.setOTP(user.id, otpCode)
    await this.mailService.registerMail(username, email, otpCode, 'Kayıt')

    return user
  }

  async verifyOtp(otp: string, id: string) {
    const user = await this.usersHelperService.findOne({ _id: id })
    if (!user) {
      throw new UnauthorizedException()
    }
    const otpCode = await this.redisService.getOTP(id)

    if (otp == otpCode) {
      await this.redisService.delOTP(id)
      return await this.usersHelperService.updateOne(id, { isVerified: true })
    } else {
      return false
    }
  }

  async getTokens(userId: string, role) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId: userId,
          role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '24d',
        },
      ),
      this.jwtService.signAsync(
        {
          userId: userId,
          role,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '24d',
        },
      ),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  async logout(userId: string) {
    const user = await this.usersHelperService.findOne({ _id: userId })
    if (!user) {
      throw new UnauthorizedException()
    }

    const storedToken = JSON.parse(await this.redisService.hGetToken(userId))
    if (storedToken) {
      await this.redisService.hSetToken(
        userId,
        JSON.stringify({ accessToken: null, refreshToken: storedToken.refreshToken }),
      )
      await this.redisService.addBlackList(JSON.stringify(storedToken.accessToken))
      return 'Logout Sucessfull'
    } else {
      return 'Logout Fail'
    }
  }

  async forgotPassword(token: string, id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersHelperService.findOne({ _id: id })
    if (!user) throw new UnauthorizedException()

    const decoded = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET })
    // Redis listesinde token kontrolü gelecek.
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword)
      throw new UnauthorizedException('Girmek istediğiniz yeni şifreler aynı değil.')
    const isSamePassword = await bcrypt.compare(changePasswordDto.confirmPassword, user.password)
    if (isSamePassword) throw new UnauthorizedException('Eski şifreniz ile yeni şifreniz aynı olamaz!')

    const hashedPassword = await bcrypt.hash(changePasswordDto.confirmPassword, 10)
    user.password = hashedPassword
    await user.save()
    return 'Şifre değiştirildi'
  }

  async forgotPasswordRequest(email: string) {
    const user = await this.usersHelperService.findOne({ email })
    if (!user) throw new UnauthorizedException()
    const payload = { userId: user.id }

    const token = await this.jwtService.signAsync(
      { payload },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      },
    )

    return `http://localhost:3000/auth/forgot-password/?token=${token}&id=${user.id}`
  }
}
