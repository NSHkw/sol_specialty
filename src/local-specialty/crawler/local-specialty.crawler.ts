import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrawlLocalSpecialty } from '../entities/local-specialty.crawler.entity';
import { Repository } from 'typeorm';
import { Region } from '../types/region.type';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SpecialtySeason } from '../types/season.type';

@Injectable()
export class LocalSpecialtyCrawler {
  private readonly logger = new Logger(LocalSpecialtyCrawler.name);
  private readonly REGION_MAP = {
    서울특별시: Region.SEOUL,
    부산광역시: Region.BUSAN,
    대구광역시: Region.DAEGU,
    인천광역시: Region.INCHEON,
    광주광역시: Region.GWANGJU,
    대전광역시: Region.DAEJUN,
    울산광역시: Region.ULSAN,
    세종특별자치시: Region.SEJONG,
    강원도: Region.GANGWON,
    경기도: Region.GYEONGGI,
    충청북도: Region.CHUNGBUK,
    충청남도: Region.CHUNGNAM,
    전라북도: Region.JEONBUK,
    전라남도: Region.JEONNAM,
    경상북도: Region.GYEONGBUK,
    경상남도: Region.GYEONGNAM,
    제주특별자치도: Region.JEJU,
  };

  constructor(
    @InjectRepository(CrawlLocalSpecialty) private localSpecialty: Repository<CrawlLocalSpecialty>,
  ) {}

  async crawlLocalData() {
    for (let i: number = 1; i <= 230; i++) {
      // 228번 index는 존재X
      try {
        await this.crawlByIndex(i);
      } catch (error) {
        this.logger.error(`Error crawling ${i}:${error.message}`);
      }
    }
  }

  private async crawlByIndex(index: number) {
    this.logger.log('poiru');
    try {
      this.logger.log('크롤링 시작------------ ');
      const url = `http://www.traveli.co.kr/area/show/${index}`;

      this.logger.log('poi');
      const response = await axios.get(url);

      const $ = cheerio.load(response.data);

      const fullLocation = $('.top_area h3')
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim()
        .split(' ');

      const regionFullName = fullLocation[0];
      const cityName = fullLocation[1] || '';

      this.logger.log(`지역: ${regionFullName}, 도시: ${cityName}`);

      this.logger.log(regionFullName);

      let region = Region.GYEONGGI; // 기본값 설정
      for (const [key, value] of Object.entries(this.REGION_MAP)) {
        if (regionFullName.includes(key)) {
          region = value;
          break; // 매칭되면 반복 중단
        }
      }

      // 특산물 목록을 배열로 변환하여 Promise.all로 처리
      const specialties = $('.sub_lst > ul > li')
        .map((_, element) => {
          const seasonText = $(element).find('.cartoons').text().trim();
          const name = $(element).find('a strong').text().trim();
          const description = $(element).find('a span').text().trim();
          const imageUrl = $(element).find('a img').attr('src');

          return {
            name,
            description,
            seasonInfo: this.parseSeasonInfo(seasonText),
            region,
            city: cityName,
            imageUrl,
          };
        })
        .get(); // cheerio 객체를 일반 배열로 변환

      // 모든 특산물 처리를 동시에 실행
      await Promise.all(
        specialties.map(async (specialty) => {
          const existing = await this.localSpecialty.findOne({
            where: {
              name: specialty.name,
              region: specialty.region,
              city: specialty.city, // 시/군까지 포함하여 중복 체크
            },
          });

          if (existing) {
            await this.localSpecialty.update(
              {
                name: specialty.name,
                region: specialty.region,
                city: specialty.city,
              },
              {
                description: specialty.description,
                season_info: specialty.seasonInfo,
                image: specialty.imageUrl,
              },
            );
            this.logger.log(
              `특산물 업데이트: ${specialty.name} from ${regionFullName} ${cityName}`,
            );
          } else {
            const newSpecialty = this.localSpecialty.create({
              name: specialty.name,
              description: specialty.description,
              season_info: specialty.seasonInfo,
              region: specialty.region,
              city: specialty.city,
              image: specialty.imageUrl,
            });

            await this.localSpecialty.save(newSpecialty);
            this.logger.log(`특산물 저장: ${specialty.name} from ${regionFullName} ${cityName}`);
          }
        }),
      );
    } catch (error) {
      throw new Error(`Failed to crawl index ${index}`);
    }
  }

  private parseSeasonInfo(text: string): SpecialtySeason[] {
    switch (text) {
      case '봄(3월~5월)':
        return [SpecialtySeason.SPRING];
      case '여름(6월~8월)':
        return [SpecialtySeason.SUMMER];
      case '가을(9월~11월)':
        return [SpecialtySeason.FALL];
      case '겨울(12월~2월)':
        return [SpecialtySeason.WINTER];
      case '제철없음':
        return [SpecialtySeason.ALL];
      default:
        return [SpecialtySeason.ALL];
    }
  }
}
