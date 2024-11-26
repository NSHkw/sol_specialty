import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { StoreProductService } from './store-product.service';
import { CreateStoreProductDto } from './dto/create-store-product.dto';
import { UpdateStoreProductDto } from './dto/update-store-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User, UserRole } from 'src/user/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('StoreProduct')
@ApiBearerAuth('access-token')
@Controller('store/:store_id/product')
export class StoreProductController {
  constructor(private readonly storeProductService: StoreProductService) {}

  // 상점 내 상품 등록, 상품 삭제, 상품 수정, 상품 조회, 상품 검색(?)

  // 상점 내 상품 등록
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetUser() user: User,
    @Param('store_id') store_id: number,
    @Body() createStoreProductDto: CreateStoreProductDto,
  ) {
    return this.storeProductService.create(user, store_id, createStoreProductDto);
  }

  // 상점 내 상품들 조회
  @Get()
  async findAll(@Param('store_id') store_id: number) {
    return this.storeProductService.findAll(store_id);
  }

  // 상점 내 상품 하나 상세 조회
  @Get(':product_id')
  async findOne(@Param('product_id') product_id: number, @Param('store_id') store_id: number) {
    return this.storeProductService.findOne(product_id, store_id);
  }

  // 상점 내 상품 수정
  @Patch(':product_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @HttpCode(HttpStatus.OK)
  async update(
    @GetUser() user: User,
    @Param('product_id') product_id: number,
    @Param('store_id') store_id: number,
    @Body() updateStoreProductDto: UpdateStoreProductDto,
  ) {
    return this.storeProductService.update(user, product_id, store_id, updateStoreProductDto);
  }

  // 상점 내 상품 삭제
  @Delete(':product_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @HttpCode(HttpStatus.OK)
  asyncdelete(
    @Param('product_id') product_id: number,
    @Param('store_id') store_id: number,
    @GetUser() user: User,
  ) {
    return this.storeProductService.delete(product_id, store_id, user);
  }
}
