import { HttpCode, HttpStatus, Query } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { SearchStoreDto } from './dto/search-store.dto';

@ApiTags('Store')
@ApiBearerAuth('access-token')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // 상점 생성, 수정, 삭제, 판매량 확인, 모든 상점 조회, 특정 상점 상세 조회, 상점 검색

  // 상점 생성
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@GetUser() user: User, @Body() createStoreDto: CreateStoreDto) {
    return this.storeService.createStore(user, createStoreDto);
  }

  // 상점 정보 수정
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: number,
    @Body() updateStoreDto: UpdateStoreDto,
    @GetUser() user: User,
  ) {
    return this.storeService.updateStore(id, user, updateStoreDto);
  }

  // 상점 삭제
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: number, @GetUser() user: User) {
    return this.storeService.deleteStore(id, user);
  }

  // 상점 검색 (쿼리 파라미터)
  @Get('search')
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(@Query() searchDto: SearchStoreDto) {
    return this.storeService.search(searchDto);
  }

  // 사이트에 존재하는 모든 상점 조회
  @Get()
  async findAllStores() {
    return this.storeService.findAllStores();
  }

  // 특정 상점 상세 조회
  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.storeService.findStoreById(id);
  }

  // 상점 판매량 확인
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Get(':id/sales')
  async checkStoreSales(@Param('id') id: number) {
    return this.storeService.checkStoreSales(id);
  }
}
