// src/local-specialty/crawler/local-specialty.crawler.ts
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
    강원도: Region.GANGWON,
    경기도: Region.GYEONGGI,
    충청북도: Region.CHUNGBUK,
    충청남도: Region.CHUNGNAM,
    전라북도: Region.JEONBUK,
    전라남도: Region.JEONNAM,
    경상북도: Region.GYEONGBUK,
    경상남도: Region.GYEONGNAM,
    제주도: Region.JEJU,
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
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Chrome/91.0.4472.124',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        },
      });

      const $ = cheerio.load(response.data);

      // 지역 이름 설정 [강원도, 강릉시]
      const regionFullName: string = $('.top_area h3').text().trim().split(' ')[0];

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
            imageUrl,
          };
        })
        .get(); // cheerio 객체를 일반 배열로 변환

      // 모든 특산물 처리를 동시에 실행
      await Promise.all(
        specialties.map(async (specialty) => {
          const existing = await this.localSpecialty.findOne({
            where: { name: specialty.name, region: specialty.region },
          });

          if (existing) {
            // 기존 데이터 업데이트
            await this.localSpecialty.update(
              { name: specialty.name, region: specialty.region },
              {
                description: specialty.description,
                season_info: specialty.seasonInfo,
                region: specialty.region,
                image: specialty.imageUrl,
              },
            );
            this.logger.log(`Updated specialty: ${specialty.name} from ${regionFullName}`);
          } else {
            // 새로운 데이터 저장
            const newSpecialty = this.localSpecialty.create({
              name: specialty.name,
              description: specialty.description,
              season_info: specialty.seasonInfo,
              region: specialty.region,
              image: specialty.imageUrl,
            });

            await this.localSpecialty.save(newSpecialty);
            this.logger.log(`Saved specialty: ${specialty.name} from ${regionFullName}`);
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
