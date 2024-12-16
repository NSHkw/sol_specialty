import { Controller, Get, Redirect, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Redirect('/index')
  redirectToIndex() {
    return;
  }

  @Get('specialties')
  getSpecialtiesMap(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'korea.html'));
  }
}
