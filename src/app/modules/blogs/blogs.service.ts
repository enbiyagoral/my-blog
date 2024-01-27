import { Injectable, NotFoundException } from '@nestjs/common'

import { CreateBlogDto, UpdateBlogDto } from './dto/index'
import { AwsService } from '../aws/aws.service'
import { RedisService } from '../redis/redis.service'
import { BlogsHelperService } from '../../../common/utils/blogs/blogs-helper.service'
import { BlogsCommonService } from '../../../shared/blogs/blogs-common.service'
import { MailService } from 'src/app/modules/mail/mail.service'
import { SearchService } from 'src/app/modules/search/search.service'

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsHelperService: BlogsHelperService,
    private readonly redisService: RedisService,
    private readonly awsService: AwsService,
    private readonly blogsCommonService: BlogsCommonService,
    private readonly mailService: MailService,
    private readonly esService: SearchService,
  ) {}

  async create(userId: string, createBlogDto: CreateBlogDto, file: Express.Multer.File) {
    try {
      const { title, description, context, category } = createBlogDto
      const blog = Object.assign({}, createBlogDto, { author: userId })

      const newBlog = await this.blogsHelperService.create(blog)

      if (file) {
        console.log('object')
        const uploadPhoto = await this.awsService.uploadPhoto(newBlog.id.toString(), file)
        newBlog.image = uploadPhoto.Location
        await newBlog.save()
        console.log('Fotoğraf yüklendi!')
      }

      const _category = await this.blogsCommonService.getCategoryById(category.toString())
      _category.blogs.push(newBlog)
      await _category.save()

      await this.blogsCommonService.addBlogFromUser(userId, newBlog.id)
      const userEmails = await this.blogsCommonService.getSubscriber(userId)

      await Promise.all(
        userEmails.map(async (userEmail) => {
          this.mailService.subscribeBlogs(userEmail, newBlog.id)
        }),
      )

      await this.esService.addBlog(newBlog)

      return { newBlog }
    } catch (error) {
      console.error('Error creating blog:', error)
      throw new Error('Error creating blog')
    }
  }

  async getBlogById(slug: string) {
    try {
      const blog = await this.blogsHelperService.findOne({ slug })

      //id kısmında dönüşüme gidebilirim
      const cachedData = await this.redisService.getOTP(blog.id)

      if (cachedData) {
        return blog
      } else {
        if (!blog) {
          throw new NotFoundException('Blog not found')
        }

        await this.redisService.setOTP(blog.id, 'blog')
        return blog
      }
    } catch (error) {
      console.error('Error getting blog by id:', error)

      throw new Error('Error getting blog by id')
    }
  }

  async updateBlogById(slug: string, updateBlogDto: UpdateBlogDto) {
    try {
      const blog = await this.blogsHelperService.findOne({ slug })
      if (!blog) {
        throw new NotFoundException('Blog not found')
      }
      await this.esService.updateByQueryBlog(blog.id, updateBlogDto)
      const { title, description, context } = updateBlogDto
      if (title) {
        blog.title = title
      }

      if (description) {
        blog.description = description
      }

      if (context) {
        blog.context = context
      }
      const newBlog = await blog.save()
      return newBlog
    } catch (error) {
      console.error('Error updating blog by id:', error)
      throw new Error('Error updating blog by id')
    }
  }

  async deleteBlogById(slug: string) {
    try {
      const blog = await this.blogsHelperService.deleteOne({ slug })

      if (!blog) {
        throw new NotFoundException('Blog not found')
      }

      await this.blogsCommonService.removeCommentFromBlog(blog.id)
      await this.blogsCommonService.removeUserFromBlog(blog.author.toString(), blog.id)
      await this.blogsCommonService.removeBlogFromCategory(blog.id, blog.category.toString())
      await this.esService.deleteByQueryBlog(blog.id)

      return blog
    } catch (error) {
      console.error('Error deleting blog by id:', error)
      throw new Error('Error deleting blog by id')
    }
  }

  async liketoBlog(slug: string, currentUser) {
    const blog = await this.blogsHelperService.findOne({ slug })

    if (!blog) {
      throw new NotFoundException('Blog not found')
    }

    if (!blog.likes.includes(currentUser)) {
      // User
      await this.blogsCommonService.addLikedFromUser(currentUser, blog.id)

      blog.likes.push(currentUser)
      await blog.save()
      return blog
    }
    return 'Already Liked to Blog'
  }

  async unliketoBlog(slug: string, currentUser) {
    const blog = await this.blogsHelperService.findOne({ slug })
    if (!blog) {
      throw new NotFoundException('Blog not found')
    }

    if (blog.likes.includes(currentUser)) {
      // User
      await this.blogsCommonService.removeLikedFromUser(currentUser, blog.id.toString())

      const result = await this.blogsHelperService.updateOne(blog.id, {
        $pull: {
          likes: currentUser,
        },
      })

      return result
    }
    return 'Already Not liked to Blog'
  }

  async savetoBlog(slug: string, currentUser) {
    const blog = await this.blogsHelperService.findOne({ slug })
    if (!blog) {
      throw new NotFoundException('Blog not found')
    }

    if (!blog.saves.includes(currentUser)) {
      // User
      await this.blogsCommonService.addLikedFromUser(currentUser, blog.id)

      blog.saves.push(currentUser)
      await blog.save()
      return blog
    }
    return 'Already Liked to Blog'
  }

  async unsavetoBlog(slug: string, currentUser) {
    const blog = await this.blogsHelperService.findOne({ slug: slug })

    if (!blog) {
      throw new NotFoundException('Blog not found')
    }

    if (blog.saves.includes(currentUser)) {
      // User
      await this.blogsCommonService.removeSavedFromUser(currentUser, blog.id)

      const result = await this.blogsHelperService.updateOne(blog.id, {
        $pull: {
          saves: currentUser,
        },
      })

      return result
    }
    return 'Already Not Saved to Blog'
  }
}
