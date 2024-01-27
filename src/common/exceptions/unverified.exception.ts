// unverified.exception.ts
import { UnauthorizedException } from '@nestjs/common'

export class UnverifiedException extends UnauthorizedException {
  constructor(
    public readonly userId: number,
    message?: string | object | any,
    error?: string,
  ) {
    super('Unverified user', error)
  }
}
