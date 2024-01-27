import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ElasticsearchService } from '@nestjs/elasticsearch'
import { BlogMapping } from './mapping/blog-index.mapping'
import { UpdateBlogDto } from '../../modules/blogs/dto'

@Injectable()
export class SearchService {
  private readonly logger: Logger

  constructor(private readonly esService: ElasticsearchService) {
    this.logger = new Logger(SearchService.name)
  }

  async createIndex() {
    const existIndex = await this.esService.indices.exists({ index: process.env.ELASTIC_INDEX })
    if (!existIndex) {
      this.logger.log('ElasticSearch Oluşturuldu!')
      return this.esService.indices.create({
        index: process.env.ELASTIC_INDEX,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
          },
          mappings: BlogMapping,
        },
      })
    } else {
      this.logger.log('ElasticSearch Başlatıldı!')
      return existIndex
    }
  }

  async addBlog(blog: any) {
    const { id, title, description, context, publishDate, slug } = blog
    const index = await this.esService.index({
      index: process.env.ELASTIC_INDEX,
      id: id,
      body: {
        title,
        description,
        context,
        publishDate,
        slug,
      },
    })

    if (index.result === 'created') {
      this.logger.log(`${index._id} added to ElasticSearch`)
      return index
    }
  }

  async deleteByQueryBlog(id: string) {
    try {
      const response = await this.esService.deleteByQuery({
        index: process.env.ELASTIC_INDEX,
        body: {
          query: {
            match: {
              id: id,
            },
          },
        },
      })
      this.logger.log('Belgeler silindi')
      return response
    } catch (error) {}
  }

  async updateByQueryBlog(id: string, updateBlogDto: UpdateBlogDto) {
    try {
      const response = await this.esService.update({
        index: process.env.ELASTIC_INDEX,
        id: id,
        body: {
          doc: updateBlogDto,
        },
      })
      this.logger.log('Belgeler güncellendi!')
      return response
    } catch (error) {
      this.logger.error('Belge güncelleme hatası', error)
    }
  }

  async search(query: string): Promise<any> {
    const result = await this.esService.search({
      index: process.env.ELASTIC_INDEX,
      body: {
        query: {
          function_score: {
            query: {
              multi_match: {
                query,
                fields: ['title^3', 'description^2', 'context'],
                fuzziness: 'auto',
              },
            },
            functions: [
              {
                filter: { match: { title: query } },
                weight: 3,
              },
              {
                filter: { match: { description: query } },
                weight: 2,
              },
            ],
            score_mode: 'sum',
          },
        },
      },
    })

    return result.hits.hits
  }
}
