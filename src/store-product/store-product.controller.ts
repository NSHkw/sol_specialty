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
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from '../user/entities/user.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { StoreProduct } from './entities/store-product.entity';
import { StoreProductResponse } from './types/store-product.type';

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
  ): Promise<StoreProductResponse<StoreProduct>> {
    return this.storeProductService.createStoreProductInStore(
      user,
      store_id,
      createStoreProductDto,
    );
  }

  // 상점 내 상품들 조회
  @Get()
  async findAllInStore(@Param('store_id') store_id: number): Promise<StoreProduct[]> {
    return this.storeProductService.findAllInStore(store_id);
  }

  // 상점 내 상품 하나 상세 조회
  @Get(':product_id')
  async findOneProductInStore(
    @Param('product_id') product_id: number,
    @Param('store_id') store_id: number,
  ): Promise<StoreProduct> {
    return this.storeProductService.findOneProductInStore(product_id, store_id);
  }

  // 상점 내 상품 수정
  @Patch(':product_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @HttpCode(HttpStatus.OK)
  async updateProductInfoInStore(
    @GetUser() user: User,
    @Param('product_id') product_id: number,
    @Param('store_id') store_id: number,
    @Body() updateStoreProductDto: UpdateStoreProductDto,
  ): Promise<StoreProductResponse<StoreProduct>> {
    return this.storeProductService.updateProductInfoInStore(
      user,
      product_id,
      store_id,
      updateStoreProductDto,
    );
  }

  // 상점 내 상품 삭제
  @Delete(':product_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SELLER)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('product_id') product_id: number,
    @Param('store_id') store_id: number,
    @GetUser() user: User,
  ): Promise<StoreProductResponse<StoreProduct>> {
    return this.storeProductService.deleteStoreProductInStore(product_id, store_id, user);
  }
}
