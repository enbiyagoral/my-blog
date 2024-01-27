import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsOptional, IsString, Length } from 'class-validator'
import { ObjectId } from 'mongoose'

export class CreateBlogDto {
  @IsString()
  @Length(1, 60)
  @ApiProperty({ minLength: 1, maxLength: 60 })
  title: string

  @IsString()
  @Length(1, 400)
  @IsOptional()
  @ApiProperty()
  description: string

  @IsString()
  @Length(50, 4000)
  @ApiProperty({ minLength: 50, maxLength: 4000 })
  context: string

  @IsMongoId()
  @ApiProperty()
  category: ObjectId
}
