import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

const MAX_REQUESTS = 10
const ipRequestCounts = new Map<string, number>()

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const clientIp = req.ip

    const requestCount = ipRequestCounts.get(clientIp) || 0
    if (requestCount >= MAX_REQUESTS) {
      return res.redirect('/auth/login')
    }
    ipRequestCounts.set(clientIp, requestCount + 1)
    next()
  }
}
