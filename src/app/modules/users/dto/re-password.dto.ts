import { IsString } from 'class-validator'
import { ChangePasswordDto } from './password.dto'
import { ApiProperty } from '@nestjs/swagger'

export class RePasswordDto extends ChangePasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  password: string
}
