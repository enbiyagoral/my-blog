import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import * as mongoose from 'mongoose'
import { Blog } from '../../../modules/blogs/schemas/blogs.model'
import slugify from 'slugify'

export type CategoryDocument = HydratedDocument<Category>

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({ unique: true, required: true, maxlength: 80 })
  name: string

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }] })
  blogs: Blog[]

  @Prop()
  slug: string
}

export const CategorySchema = SchemaFactory.createForClass(Category)

CategorySchema.pre('validate', function (next) {
  if (!this.slug || this.isModified('name')) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000)
    const baseSlug = slugify(this.name, { lower: true, strict: true })
    this.slug = `${baseSlug}-${randomSuffix}`
  }
  next()
})
