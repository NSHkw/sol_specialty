import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('specialties')
  getSpecialtiesMap(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'korea.html'));
  }
}
