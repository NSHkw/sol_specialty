import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('map')
export class MapController {
  @Get()
  serveMap(@Res() res: Response) {
    res.sendFile(join(__dirname, '../..', 'public', 'index.html'));
  }
}