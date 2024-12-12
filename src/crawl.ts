// src/crawl.ts
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlLocalSpecialty } from './local-specialty/entities/local-specialty.crawler.entity';
import { LocalSpecialtyCrawler } from './local-specialty/crawler/local-specialty.crawler';
import { Command, CommandRunner, CommandFactory } from 'nest-commander';
import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Command({ name: 'crawl-specialty', description: '지역 특산물 데이터 크롤링' })
export class CrawlSpecialtyCommand extends CommandRunner {
  private readonly logger = new Logger(CrawlSpecialtyCommand.name);

  constructor(private readonly crawler: LocalSpecialtyCrawler) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('크롤링을 시작합니다...');
      await this.crawler.crawlLocalData();
      this.logger.log('크롤링이 완료되었습니다.');
    } catch (error) {
      this.logger.error('크롤링 중 오류가 발생했습니다:', error);
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [CrawlLocalSpecialty],
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),
    TypeOrmModule.forFeature([CrawlLocalSpecialty]),
  ],
  providers: [LocalSpecialtyCrawler, CrawlSpecialtyCommand],
})
class CrawlerModule {}

async function bootstrap() {
  await NestFactory.create(CrawlerModule, {
    logger: ['log', 'error', 'warn', 'debug'], // 로깅 레벨 설정
  });

  const logger = new Logger('CrawlerBootstrap');
  logger.log('크롤러 애플리케이션을 시작합니다...');

  try {
    await CommandFactory.run(CrawlerModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
  } catch (error) {
    logger.error('크롤러 실행 중 오류 발생:', error);
  }
}

bootstrap();
