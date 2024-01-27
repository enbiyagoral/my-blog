import { Module } from '@nestjs/common'
import { AwsService } from './aws.service'
import { AwsConfigService } from './config/aws.config'

@Module({
  providers: [AwsConfigService, AwsService],
  exports: [AwsConfigService, AwsService],
})
export class AwsModule {}
