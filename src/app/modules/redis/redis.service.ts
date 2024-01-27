import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import { REDIS_CLIENT, RedisClient } from './redis-client.type'

@Injectable()
export class RedisService implements OnModuleDestroy {
  public constructor(@Inject(REDIS_CLIENT) private readonly redis: RedisClient) {}

  onModuleDestroy() {
    this.redis.quit()
  }

  ping() {
    return this.redis.ping()
  }

  async getOTP(key: string) {
    const verifyKey = `verify-otp:${key}`
    return await this.redis.get(verifyKey)
  }

  async setOTP(key: string, value: string) {
    const verifyKey = `verify-otp:${key}`
    return await this.redis.set(verifyKey, value)
  }

  async delOTP(key: string) {
    const verifyKey = `verify-otp:${key}`
    return await this.redis.del(verifyKey)
  }

  async hSetToken(userId: string, data: string) {
    return await this.redis.hSet('refresh-tokens', userId, data)
  }

  async hGetToken(userId: string) {
    return await this.redis.hGet('refresh-tokens', userId)
  }

  async addBlackList(data) {
    return await this.redis.rPush('blog/black-list', data)
  }
}
