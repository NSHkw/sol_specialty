import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';

@Module({
  controllers: [MapController],
  providers: [MapService], // MapService를 provider로 추가
  exports: [MapService], // 다른 모듈에서 사용할 수 있도록 export
})
export class MapModule {}
