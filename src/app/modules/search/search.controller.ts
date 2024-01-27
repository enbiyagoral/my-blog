import { Controller, Post, Query } from '@nestjs/common'
import { SearchService } from './search.service'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async searchingBlog(@Query('q') query: string) {
    return await this.searchService.search(query)
  }
}
