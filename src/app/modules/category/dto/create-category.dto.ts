import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class CreateCategory {
  @IsString()
  @MaxLength(80)
  @ApiProperty({ maxLength: 80 })
  name: string
}
