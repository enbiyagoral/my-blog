import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { Blog } from '../../blogs/schemas/blogs.model'
import { Role } from 'src/app/modules/auth/enums/role.enum'

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  username: string

  @Prop({ unique: true, required: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ default: false })
  isVerified: boolean

  @Prop({ default: new Date('1990-01-01') })
  birthdate: Date

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }] })
  blogs: Blog[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  followers: User[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  following: User[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  saved: User[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  liked: User[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  subscriber: User[]

  @Prop({ default: Role.USER, select: true })
  role: Role[]
}

export const UserSchema = SchemaFactory.createForClass(User)
