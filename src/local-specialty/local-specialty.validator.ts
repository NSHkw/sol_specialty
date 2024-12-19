import { LocalSpecialtyRepository } from 'src/local-specialty/local-specialty.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Region } from './types/region.type';

@Injectable()
export class LocalSpecialtyValidator {
  constructor(private readonly localSpecialtyRepository: LocalSpecialtyRepository) {}

  async validateLocalSpecialtyExists(id: number): Promise<void> {
    const specialty = await this.localSpecialtyRepository.findById(id);
    if (!specialty) {
      throw new NotFoundException('특산품 찾을 수 없음');
    }
  }

  async validateRegion(region: Region): Promise<void> {
    const validateRegion = Object.values(Region);
    if (!validateRegion.includes(region)) {
      throw new NotFoundException('유효하지 않은 지역');
    }
  }
}
