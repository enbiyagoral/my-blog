import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'

import * as bcrypt from 'bcrypt'

import { RePasswordDto } from './dto/re-password.dto'
import { UsersHelperService } from '../../../common/utils/users/users-helper.service'

@Injectable()
export class UsersService {
  constructor(private readonly usersHelperService: UsersHelperService) {}

  async me(user: string) {
    return await this.usersHelperService.findOne({ _id: user })
  }

  async follow(userId: string, id: string) {
    const myUser = await this.usersHelperService.findOne({ _id: userId })
    const otherUser = await this.usersHelperService.findOne({ _id: id })

    if (otherUser.id == myUser.id) throw new BadRequestException('Kendinizi takip edemezsiniz')

    if (!myUser.following?.includes(otherUser.id)) {
      await this.usersHelperService.updateOne(myUser.id, {
        $push: {
          following: otherUser.id,
        },
      })

      if (!otherUser.followers?.includes(myUser.id)) {
        await this.usersHelperService.updateOne(otherUser.id, {
          $push: {
            followers: myUser.id,
          },
        })
      }

      return { myUser, otherUser }
    }

    return { myUser, otherUser }
  }

  async unFollow(userId: string, id: string) {
    const myUser = await this.usersHelperService.findOne({ _id: userId })
    const otherUser = await this.usersHelperService.findOne({ _id: id })

    if (otherUser.id == myUser.id) throw new BadRequestException('Kendinizi takip edemezsiniz')

    if (myUser.following?.includes(otherUser.id)) {
      await this.usersHelperService.updateOne(myUser.id, {
        $pull: {
          following: otherUser.id,
        },
      })

      if (otherUser.followers?.includes(myUser.id)) {
        await this.usersHelperService.updateOne(otherUser.id, {
          $pull: {
            followers: myUser.id,
          },
        })
      }

      return { myUser, otherUser }
    }

    return { myUser, otherUser }
  }

  async subscribe(userId: string, id: string) {
    const myUser = await this.usersHelperService.findOne({ _id: userId })
    const otherUser = await this.usersHelperService.findOne({ _id: id })
    if (otherUser.id == myUser.id) throw new BadRequestException('Kendinizi takip edemezsiniz')
    if (!myUser.following?.includes(otherUser.id)) {
      await this.usersHelperService.updateOne(myUser.id, {
        $push: {
          subscriber: otherUser.id,
        },
      })

      return { myUser, otherUser }
    }
    return { myUser, otherUser }
  }

  async resetPassword(userId: string, rePasswordDto: RePasswordDto) {
    const user = await this.usersHelperService.findOneSelectPassword({ _id: userId })
    if (!user) throw new UnauthorizedException()

    const isCheckPassword = await bcrypt.compare(rePasswordDto.password, user.password)
    if (!isCheckPassword) throw new UnauthorizedException('Eski şifreniz yanlış girildi.')
    if (rePasswordDto.newPassword !== rePasswordDto.confirmPassword)
      throw new UnauthorizedException('Girmek istediğiniz yeni şifreler aynı değil.')
    const isSamePassword = await bcrypt.compare(rePasswordDto.confirmPassword, user.password)
    if (isSamePassword) throw new UnauthorizedException('Eski şifreniz ile yeni şifreniz aynı olamaz!')

    const hashedPassword = await bcrypt.hash(rePasswordDto.confirmPassword, 10)
    user.password = hashedPassword
    await user.save()
    return 'Şifreniz Başarıyla Güncellendi!'
  }

  async deleteUser(id: string) {
    return await this.usersHelperService.deleteUser(id)
  }

  async getLikes(username: string) {
    const result = await this.usersHelperService.findOne({ username })
    return result.liked
  }
}
