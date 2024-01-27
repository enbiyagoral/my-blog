import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ uniqueItems: true, required: true })
  email: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  password: string
}
