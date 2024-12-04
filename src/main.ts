import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Solo Specialty API')
    .setDescription('Solo Specialty 프로젝트 API')
    .setVersion('1.0')
    .addTag('auth', '인증 관련 API')
    .addTag('users', '사용자 관련 API')
    .addTag('stores', '상점 관련 API')
    .addTag('products', '상품 관련 API')
    .addTag('orders', '주문 관련 API')
    .addTag('reviews', '리뷰 관련 API')
    .addTag('cart', '장바구니 관련 API')
    .addTag('local-specialty', '특산물 관련 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    index: false,
    prefix: '/',
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
