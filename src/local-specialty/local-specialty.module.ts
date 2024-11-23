import { Module } from '@nestjs/common';
import { LocalSpecialtyService } from './local-specialty.service';
import { LocalSpecialtyController } from './local-specialty.controller';

@Module({
  controllers: [LocalSpecialtyController],
  providers: [LocalSpecialtyService],
})
export class LocalSpecialtyModule {}
