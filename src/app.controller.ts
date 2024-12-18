import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '서버 상태 확인',
    description: '서버가 정상적으로 동작하는지 확인합니다.',
  })
  @ApiResponse({ status: 200, description: '서버 포트 번호를 반환합니다.' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('specialties')
  getSpecialtiesMap(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'korea.html'));
  }
}
