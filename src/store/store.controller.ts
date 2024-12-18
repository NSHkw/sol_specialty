// src/store/store.controller.ts
import { HttpCode, HttpStatus } from '@nestjs/common';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../user/entities/user.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { SearchStoreDto } from './dto/search-store.dto';
import { SearchResult, StoreBaseInfo, StoreDetailInfo, StoreResponse } from './types/store.type';
import { Store } from './entities/store.entity';

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
  async create(
    @GetUser() user: User,
    @Body() createStoreDto: CreateStoreDto,
  ): Promise<StoreResponse<Store>> {
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
  ): Promise<StoreResponse> {
    return this.storeService.updateStoreInfo(id, user, updateStoreDto);
  }

  // 상점 삭제
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: number, @GetUser() user: User): Promise<StoreResponse> {
    return this.storeService.deleteStore(id, user);
  }

  // 상점 검색
  @Post('search')
  async search(@Body() searchDto: SearchStoreDto): Promise<SearchResult> {
    return this.storeService.searchStore(searchDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':userId/storeid')
  async getStoreByUserId(@Param('userId') userId: number): Promise<Store> {
    return this.storeService.findStoreByUserId(userId);
  }

  // 사이트에 존재하는 모든 상점 조회
  @Get()
  async findAllStores(): Promise<StoreBaseInfo[]> {
    return this.storeService.findAllStores();
  }

  // 특정 상점 상세 조회
  @Get(':id')
  async findById(@Param('id') id: number): Promise<StoreDetailInfo> {
    return this.storeService.findStoreByStoreId(id);
  }
}
