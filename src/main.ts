import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/modules/app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  const configService = app.get(ConfigService)
  const port = configService.get<string>('port')

  app.use(helmet())

  const config = new DocumentBuilder()
    .setTitle('Blogs Api')
    .setDescription('The Blogs API description')
    .setVersion('2.0')
    .addTag('blogs')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
}
bootstrap()
