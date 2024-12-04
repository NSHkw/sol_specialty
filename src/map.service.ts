import { Injectable } from '@nestjs/common';

@Injectable()
export class MapService {
  private readonly regions = [
    {
      name: '경기도',
      lat: 37.4138,
      lng: 127.5183,
      specialties: ['이천 쌀', '안성 배', '포천 막걸리', '가평 잣', '양평 한우'],
    },
    {
      name: '강원도',
      lat: 37.8228,
      lng: 128.1555,
      specialties: ['횡성 한우', '강릉 초당두부', '양양 송이', '속초 오징어'],
    },
    {
      name: '충청북도',
      lat: 36.6358,
      lng: 127.4914,
      specialties: ['충주 사과', '청주 직지', '보은 대추', '영동 포도', '괴산 고추'],
    },
    {
      name: '충청남도',
      lat: 36.6588,
      lng: 126.8,
      specialties: ['서산 마늘', '논산 딸기', '부여 연꽃', '예산 사과', '공주 밤'],
    },
    {
      name: '전라북도',
      lat: 35.8202,
      lng: 127.1089,
      specialties: ['순창 고추장', '고창 복분자', '임실 치즈', '남원 추어탕', '전주 비빔밥'],
    },
    {
      name: '전라남도',
      lat: 34.816,
      lng: 126.4629,
      specialties: ['보성 녹차', '영광 굴비', '담양 죽순', '나주 배', '여수 갓김치'],
    },
    {
      name: '경상북도',
      lat: 36.576,
      lng: 128.5055,
      specialties: ['안동 간고등어', '영덕 대게', '의성 마늘', '상주 곶감', '청도 감'],
    },
    {
      name: '경상남도',
      lat: 35.4606,
      lng: 128.2132,
      specialties: ['진주 비빔밥', '남해 멸치', '하동 녹차', '밀양 대추', '통영 굴'],
    },
    {
      name: '제주도',
      lat: 33.4996,
      lng: 126.5312,
      specialties: ['제주 감귤', '제주 흑돼지', '제주 한라봉', '제주 옥돔', '제주 녹차'],
    },
  ];

  getAllRegions() {
    return this.regions;
  }

  getRegionByName(name: string) {
    return this.regions.find((region) => region.name === name);
  }

  getSpecialtiesByRegion(name: string) {
    const region = this.getRegionByName(name);
    return region ? region.specialties : null;
  }
}
