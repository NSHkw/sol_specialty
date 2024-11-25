import { Test, TestingModule } from '@nestjs/testing';
import { StoreProductService } from './store-product.service';

describe('StoreProductService', () => {
  let service: StoreProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreProductService],
    }).compile();

    service = module.get<StoreProductService>(StoreProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
