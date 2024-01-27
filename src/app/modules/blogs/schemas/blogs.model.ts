import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'
import { Category } from '../../category/schemas/category.model'
import { Comment } from '../../comments/schemas/comments.model'
import { User } from '../../users/schemas/user.model'
import slugify from 'slugify'

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
  },
})
export class Blog {
  @Prop({ required: true, maxlength: 60 })
  title: string

  @Prop({ maxlength: 400 })
  description: string

  @Prop({ required: true, minlength: 50, maxlength: 4000 })
  context: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] })
  comments: Comment[]

  @Prop({ type: Date, default: Date.now })
  publishDate: Date

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  author: User

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  category: Category

  @Prop()
  slug: string

  @Prop()
  image: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  likes: User[]

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  saves: User[]
}

export type BlogDocument = HydratedDocument<Blog>
export const BlogSchema = SchemaFactory.createForClass(Blog)

BlogSchema.pre('validate', async function (next) {
  // Eğer daha önce slug oluşturulmamışsa veya değişmişse
  if (!this.slug || this.isModified('title')) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const baseSlug = slugify(this.title, { lower: true, strict: true })
    this.slug = `${baseSlug}-${randomSuffix}`
  }
  next()
})

BlogSchema.virtual('readTime').get(function () {
  const wordsPerMinute = 200
  const words = this.context.split(/\s+/).length
  const readTimeInMinutes = words / wordsPerMinute
  const roundedReadTime = Math.ceil(readTimeInMinutes)
  return roundedReadTime
})
