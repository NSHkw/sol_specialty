import { Test, TestingModule } from '@nestjs/testing';
import { LocalSpecialtyController } from './local-specialty.controller';
import { LocalSpecialtyService } from './local-specialty.service';

describe('LocalSpecialtyController', () => {
  let controller: LocalSpecialtyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalSpecialtyController],
      providers: [LocalSpecialtyService],
    }).compile();

    controller = module.get<LocalSpecialtyController>(LocalSpecialtyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
