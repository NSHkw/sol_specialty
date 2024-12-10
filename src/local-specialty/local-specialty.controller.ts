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
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateLocalSpecialtyDto } from './dto/create-local-specialty.dto';
import { User, UserRole } from 'src/user/entities/user.entity';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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
   * 특산품 생성
   * @param user 유저 정보
   * @param createDto 특산품 생성 정보
   * @returns 특산품 생성 결과
   * UseGuard 데코레이터가 있는 라우트는 메소드 실행 전 JWT 토큰 검증을 거친다
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@GetUser() user: User, @Body() createDto: CreateLocalSpecialtyDto) {
    return this.localSpecialtyService.create(user, createDto);
  }

  /**
   * 특산품 삭제
   * @param user 유저 정보
   * @param id 특산품 id
   * @returns 특산품 삭제 결과
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  delete(@GetUser() user: User, @Param('id') id: number) {
    return this.localSpecialtyService.delete(user, id);
  }

  /**
   * 특산품 수정
   * @param user 유저 정보
   * @param id 특산품 id
   * @param updateDto 특산품 수정 정보
   * @returns 특산품 수정 결과
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  update(
    @GetUser() user: User,
    @Param('id') id: number,
    @Body() updateDto: UpdateLocalSpecialtyDto,
  ) {
    return this.localSpecialtyService.update(user, id, updateDto);
  }

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
