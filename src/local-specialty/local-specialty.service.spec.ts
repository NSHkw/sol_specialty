import { Test, TestingModule } from '@nestjs/testing';
import { LocalSpecialtyService } from './local-specialty.service';

describe('LocalSpecialtyService', () => {
  let service: LocalSpecialtyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalSpecialtyService],
    }).compile();

    service = module.get<LocalSpecialtyService>(LocalSpecialtyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
