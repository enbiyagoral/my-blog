import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Length } from 'class-validator'

export class UpdateBlogDto {
  @IsString()
  @Length(1, 60)
  @IsOptional()
  @ApiProperty({ minLength: 1, maxLength: 60 })
  title?: string

  @IsString()
  @Length(1, 100)
  @IsOptional()
  @ApiProperty({ minLength: 1, maxLength: 100 })
  description?: string

  @IsString()
  @Length(50, 2000)
  @IsOptional()
  @ApiProperty({ minLength: 50, maxLength: 2000 })
  context?: string
}
