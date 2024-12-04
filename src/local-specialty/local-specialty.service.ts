import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LocalSpecialty } from './entities/local-specialty.entity';
import { IsNull, Like, Repository } from 'typeorm';
import { CreateLocalSpecialtyDto } from './dto/create-local-specialty.dto';
import { User } from 'src/user/entities/user.entity';
import { Region } from './types/region.type';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchLocalSpecialtyDto } from './dto/search-local-specialty.dto';
import { UpdateLocalSpecialtyDto } from './dto/update-local-specialty.dto';
import { AuthUtils } from 'src/common/utils/auth.utils';
import { SpecialtySeason } from './types/season.type';

// 생성, 삭제, 전체 조회, 지역별 조회, id로 조회, 검색
@Injectable()
export class LocalSpecialtyService {
  constructor(
    @InjectRepository(LocalSpecialty)
    private readonly localSpecialtyRepository: Repository<LocalSpecialty>,
  ) {}

  /**
   * 특산품 생성
   * @param user 유저
   * @param createDto 특산품 생성 정보
   * @returns 특산품 생성 결과
   */
  async create(user: User, createDto: CreateLocalSpecialtyDto) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const { name } = createDto;
    const existedSpecialty = await this.localSpecialtyRepository.findOne({
      where: { name },
    });

    if (existedSpecialty) {
      throw new BadRequestException('이미 존재하는 특산품 이름');
    }

    // ALL이 포함된 경우 다른 계절을 함께 선택할 수 없도록 검증 (제철에 대한 정보 설정을 위한 것)
    if (createDto.season_info.includes(SpecialtySeason.ALL) && createDto.season_info.length > 1) {
      throw new BadRequestException('제철 없음은 다른 계절과 함께 선택할 수 없습니다');
    }

    // create는 repository의 인스턴스를 만드는 메서드
    const specialty = this.localSpecialtyRepository.create(createDto);

    // specialty를 데이터베이스(repository)에 저장
    return await this.localSpecialtyRepository.save(specialty);
  }

  /**
   * 특산품 삭제
   * @param user 유저
   * @param id 특산품 id
   * @returns 특산품 삭제 결과
   */
  async delete(user: User, id: number) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    const specialty = await this.localSpecialtyRepository.findOne({
      where: { id },
    });

    // 특산품 존재 예외처리
    if (!specialty) {
      throw new NotFoundException('특산품 찾지 못함');
    }

    // 특산품 삭제 (repository의 인스턴스를 삭제하는 메서드-> 여기서 인스턴스는 specialty)
    // delete와의 차이점이라면 delete는 specialty의 id만 가지고 삭제가 가능, remove는 인스턴스 자체를 삭제시킨 뒤, 원래의 repository에 집어넣는 방식
    await this.localSpecialtyRepository.remove(specialty);

    return { message: '특산품 삭제 완료' };
  }

  /**
   * 특산품 수정
   * @param user 유저
   * @param id 특산품 id
   * @param updateDto 특산품 수정 정보
   * @returns 특산품 수정 결과
   */
  async update(user: User, id: number, updateDto: UpdateLocalSpecialtyDto) {
    // 로그인 체크
    AuthUtils.validateLogin(user);

    // repository에서 where에 맞는 인스턴스를 찾는 것
    const specialty = await this.localSpecialtyRepository.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!specialty) {
      throw new NotFoundException('특산품 찾지 못함');
    }

    // 새로운 dto의 데이터 기반으로 지역특산물 엔티티 인스턴스를 생성
    const updatedSpecialty = this.localSpecialtyRepository.create(updateDto);

    // 엔티티 인스턴스를 데이터베이스에 업데이트 (DB에 직접적으로 변경 사항을 반영시킨다)-> 이 과정에서 인스턴스를 생성하는 것이 아닌, 기존 데이터에 변경 사항을 적용시키는 것
    await this.localSpecialtyRepository.update(id, updatedSpecialty);

    return { message: '수정 완료', updatedSpecialty };
  }

  /**
   * 특산품 전체 조회
   * @returns 특산품 전체 조회 결과
   */
  async findAll(): Promise<LocalSpecialty[]> {
    // find는 조건에 맞는 모든 엔티티 인스턴스를 배열 형태로 반환시킨다
    return this.localSpecialtyRepository.find({
      select: { id: true, name: true, season_info: true, region: true },
      where: {
        deleted_at: IsNull(),
      },
    });
  }

  /**
   * 특산품 지역별 조회
   * @param region 지역
   * @returns 특산품 지역별 조회 결과
   */
  async findByRegion(region: Region): Promise<LocalSpecialty[]> {
    return this.localSpecialtyRepository.find({
      where: { region, deleted_at: IsNull() },
      relations: {
        store_products: true,
      },
    });
  }

  /**
   * 특산품 id로 조회
   * @param id 특산품 id
   * @returns 특산품 id로 조회 결과
   */
  async findById(id: number) {
    const specialty = await this.localSpecialtyRepository.findOne({
      where: { id, deleted_at: IsNull() },
      select: {
        id: true,
        name: true,
        description: true,
        season_info: true,
        region: true,
        created_at: true,
      },
      relations: {
        store_products: true,
      },
    });

    if (!specialty) {
      throw new NotFoundException('특산품 찾지 못함');
    }

    return specialty;
  }

  // 필요한 경우 storeProducts 포함하여 조회하는 메서드 추가
  // async findAllWithStoreProducts(): Promise<LocalSpecialty[]> {
  //   return this.localSpecialtyRepository.find({
  //     where: {
  //       deleted_at: IsNull(),
  //     },
  //     relations: ['storeProducts'],
  //   });
  // }

  /**
   * 특산품 검색
   * @param searchDto 검색 조건
   * @returns 특산품 검색 결과
   */
  async search(searchDto: SearchLocalSpecialtyDto): Promise<LocalSpecialty[]> {
    const condition: any = {
      deleted_at: IsNull(),
    };

    if (searchDto.keyword) {
      condition.name = Like(`%${searchDto.keyword}%`);
    }

    if (searchDto.region) {
      condition.region = searchDto.region;
    }

    return await this.localSpecialtyRepository.find({
      where: condition,
    });
  }
}
