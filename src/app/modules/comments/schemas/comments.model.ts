import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'
import { Blog } from '../../../modules/blogs/schemas/blogs.model'
import { User } from '../../users/schemas/user.model'

export type CommmentDocument = HydratedDocument<Comment>

@Schema({
  timestamps: true,
})
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true })
  blogId: Blog

  @Prop({ maxlength: 200 })
  context: string
}

export const CommmentSchema = SchemaFactory.createForClass(Comment)
