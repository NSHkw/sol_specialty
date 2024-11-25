import { Test, TestingModule } from '@nestjs/testing';
import { StoreProductController } from './store-product.controller';
import { StoreProductService } from './store-product.service';

describe('StoreProductController', () => {
  let controller: StoreProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreProductController],
      providers: [StoreProductService],
    }).compile();

    controller = module.get<StoreProductController>(StoreProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
