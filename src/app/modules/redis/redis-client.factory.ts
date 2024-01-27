import { FactoryProvider } from '@nestjs/common'
import { createClient } from 'redis'
import { RedisClient, REDIS_CLIENT } from './redis-client.type'
import { ConfigService } from '@nestjs/config'

export const redisClientFactory: FactoryProvider<Promise<RedisClient>> = {
  provide: REDIS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    const client = createClient({ url: process.env.REDIS_URL })
    await client.connect()
    return client
  },
}
