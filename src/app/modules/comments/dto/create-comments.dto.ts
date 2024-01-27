import { ApiProperty } from '@nestjs/swagger'

export class CreateCommentDto {
  @ApiProperty()
  context: string
}
