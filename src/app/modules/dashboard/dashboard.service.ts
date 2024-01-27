import { Injectable } from '@nestjs/common'
import { BlogsHelperService } from 'src/common/utils/blogs/blogs-helper.service'
import { UsersHelperService } from 'src/common/utils/users/users-helper.service'

@Injectable()
export class DashboardService {
  constructor(
    private readonly blogsHelperService: BlogsHelperService,
    private readonly usersHelperService: UsersHelperService,
  ) {}
  async getHomePage(currentUserId: string) {
    const followingUsers = await this.usersHelperService.getFollowingfUsers(currentUserId)
    const blogsPromises = followingUsers.map((user) => this.blogsHelperService.findBlogsByUserId(user.toString()))

    const blogs = await Promise.all(blogsPromises)
    const sortedBlogs = [].concat(...blogs).sort((a, b) => b.publishDate - a.publishDate)
    return sortedBlogs
  }

  async getMostLikedBlogs(currentUserId: string) {
    const blogs = await this.blogsHelperService.getMostBlogs('likes')
    return blogs
  }

  async getMostSavedBlogs(currentUserId: string) {
    const blogs = await this.blogsHelperService.getMostBlogs('saves')
    return blogs
  }
}
