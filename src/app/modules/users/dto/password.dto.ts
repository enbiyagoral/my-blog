import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  newPassword: string

  @ApiProperty({ required: true })
  @IsString()
  confirmPassword: string
}
