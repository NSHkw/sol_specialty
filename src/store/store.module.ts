import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { UserModule } from '../user/user.module';
import { ReviewModule } from '../review/review.module';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { StoreRepository } from './store.repository';
import { StoreValidator } from './store.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store, User]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => ReviewModule),
  ],
  controllers: [StoreController],
  providers: [
    StoreService,
    {
      provide: StoreRepository,
      useClass: StoreRepository,
    },
    StoreValidator,
  ],
  exports: [StoreService, StoreRepository, TypeOrmModule, StoreValidator],
})
export class StoreModule {}
