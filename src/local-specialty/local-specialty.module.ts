import { forwardRef, Module } from '@nestjs/common';
import { LocalSpecialtyService } from './local-specialty.service';
import { LocalSpecialtyController } from './local-specialty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalSpecialty } from './entities/local-specialty.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { User } from '../user/entities/user.entity';
import { LocalSpecialtyRepository } from './local-specialty.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocalSpecialty, User]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [LocalSpecialtyController],
  providers: [
    LocalSpecialtyService,
    {
      provide: LocalSpecialtyRepository,
      useClass: LocalSpecialtyRepository,
    },
  ],
  exports: [LocalSpecialtyService, LocalSpecialtyRepository, TypeOrmModule],
})
export class LocalSpecialtyModule {}
