import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocalSpecialtyService } from './local-specialty.service';
import { CreateLocalSpecialtyDto } from './dto/create-local-specialty.dto';
import { UpdateLocalSpecialtyDto } from './dto/update-local-specialty.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Specialty')
@Controller('local-specialty')
export class LocalSpecialtyController {
  constructor(private readonly localSpecialtyService: LocalSpecialtyService) {}

  @Post()
  create(@Body() createLocalSpecialtyDto: CreateLocalSpecialtyDto) {
    return this.localSpecialtyService.create(createLocalSpecialtyDto);
  }

  @Get()
  findAll() {
    return this.localSpecialtyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localSpecialtyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocalSpecialtyDto: UpdateLocalSpecialtyDto) {
    return this.localSpecialtyService.update(+id, updateLocalSpecialtyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localSpecialtyService.remove(+id);
  }
}
