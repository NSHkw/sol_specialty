// src/configs/database.config.ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const typeormModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    // 환경 변수로 데이터베이스 선택
    const isTestMode = configService.get<string>('NODE_ENV') === 'test';

    return isTestMode
      ? {
          // 테스트용 SQLite 설정
          type: 'sqlite',
          database: ':memory:', // 인메모리 데이터베이스
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
          dropSchema: true,
          extra: {
            charset: 'utf8mb4_unicode_ci',
          },
          entitySkipConstructor: true,
          supportBigNumbers: true,
          bigNumberStrings: true,
          options: {
            enableSqliteEnumProcessing: false,
          },
        }
      : {
          // 기존 MySQL 설정
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          synchronize: configService.get<boolean>('DB_SYNC'),
          autoLoadEntities: true,
          logging: true,
          namingStrategy: new SnakeNamingStrategy(),
        };
  },
};
