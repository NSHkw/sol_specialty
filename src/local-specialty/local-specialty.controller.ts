// src/local-specialty/local-specialty.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocalSpecialtyService } from './local-specialty.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateLocalSpecialtyDto } from './dto/create-local-specialty.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { GetUser } from '../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Region } from './types/region.type';
import { SearchLocalSpecialtyDto } from './dto/search-local-specialty.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateLocalSpecialtyDto } from './dto/update-local-specialty.dto';

// 특산품 생성, 삭제, 전체 조회, 지역별 조회, id로 조회, 검색
// TODO: 예외 처리, name이 같은 특산품 등록 시 예외 처리 추가
@ApiTags('Local Specialty')
@ApiBearerAuth('access-token')
@Controller('specialty')
export class LocalSpecialtyController {
  constructor(private readonly localSpecialtyService: LocalSpecialtyService) {}

  /**
   * 특산품 전체 조회
   * @returns 특산품 전체 조회 결과
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.localSpecialtyService.findAll();
  }

  /**
   * 특산품 지역별 조회
   * @param region 지역
   * @returns 특산품 지역별 조회 결과
   */
  @Get('region/:region')
  findByRegion(@Param('region') region: Region) {
    return this.localSpecialtyService.findByRegion(region);
  }

  /**
   * 특산품 id로 조회
   * @param id 특산품 id
   * @returns 특산품 id로 조회 결과
   */
  @Get(':id')
  findById(@Param('id') id: number) {
    return this.localSpecialtyService.findById(id);
  }

  // storeProducts를 포함한 전체 조회 엔드포인트 추가 (필요한 경우)
  // @Get('with-store-products')
  // @HttpCode(HttpStatus.OK)
  // findAllWithStoreProducts() {
  //   return this.localSpecialtyService.findAllWithStoreProducts();
  // }

  /**
   * 특산품 검색
   * @param searchDto 검색 조건
   * @returns 특산품 검색 결과
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  search(@Body() searchDto: SearchLocalSpecialtyDto) {
    return this.localSpecialtyService.search(searchDto);
  }
}
