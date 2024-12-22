import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrawlLocalSpecialty } from '../entities/local-specialty.crawler.entity';
import { Repository } from 'typeorm';
import { Region } from '../types/region.type';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SpecialtySeason } from '../types/season.type';

type SpecialtyCrawlData = {
  name: string;
  description: string;
  seasonInfo: SpecialtySeason[];
  region: Region;
  city: string;
  imageUrl: string;
};

const REGION_MAP: Record<string, Region> = {
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
@Injectable()
export class LocalSpecialtyCrawler {
  private readonly logger = new Logger(LocalSpecialtyCrawler.name);
  private readonly CrawlURL = 'http://www.traveli.co.kr/area/show';

  constructor(
    @InjectRepository(CrawlLocalSpecialty) private localSpecialty: Repository<CrawlLocalSpecialty>,
  ) {}

  async crawlLocalData(): Promise<void> {
    for (let i = 1; i <= 230; i++) {
      // 228번 index는 존재X
      try {
        await this.crawlByIndex(i);
      } catch (error) {
        this.logger.error(`에러 인덱스 ${i}:${error.message}`);
      }
    }
  }

  private async crawlByIndex(index: number): Promise<void> {
    try {
      this.logger.log(`크롤링 시작, 인덱스 ${index}...`);
      const response = await axios.get(`${this.CrawlURL}/${index}`);
      const $ = cheerio.load(response.data);

      const { region, cityName } = this.parseLocation($);
      const specialties = this.parseSpecialties($, region, cityName);

      await this.saveSpecialties(specialties);
    } catch (error) {
      throw new Error(`크롤링 실패 ${index}: ${error.message}`);
    }
  }

  private parseLocation($: cheerio.CheerioAPI): { region: Region; cityName: string } {
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

    let region = Region.GYEONGGI;
    for (const [key, value] of Object.entries(REGION_MAP)) {
      if (regionFullName.includes(key)) {
        region = value;
        break;
      }
    }

    return { region, cityName };
  }

  private parseSpecialties(
    $: cheerio.CheerioAPI,
    region: Region,
    cityName: string,
  ): SpecialtyCrawlData[] {
    return $('.sub_lst > ul > li')
      .map((_, element): SpecialtyCrawlData => {
        const seasonText = $(element).find('.cartoons').text().trim();
        const name = $(element).find('a strong').text().trim();
        const description = $(element).find('a span').text().trim();
        const imageUrl = $(element).find('a img').attr('src') || '';

        return {
          name,
          description,
          seasonInfo: this.parseSeasonInfo(seasonText),
          region,
          city: cityName,
          imageUrl,
        };
      })
      .get();
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

  private async saveSpecialties(specialties: SpecialtyCrawlData[]): Promise<void> {
    await Promise.all(
      specialties.map(async (specialty) => {
        const existing = await this.localSpecialty.findOne({
          where: {
            name: specialty.name,
            region: specialty.region,
            city: specialty.city,
          },
        });

        if (existing) {
          await this.updateSpecialty(existing, specialty);
        } else {
          await this.createSpecialty(specialty);
        }
      }),
    );
  }

  private async updateSpecialty(
    existing: CrawlLocalSpecialty,
    specialty: SpecialtyCrawlData,
  ): Promise<void> {
    await this.localSpecialty.update(
      {
        name: existing.name,
        region: existing.region,
        city: existing.city,
      },
      {
        description: specialty.description,
        season_info: specialty.seasonInfo,
        image: specialty.imageUrl,
      },
    );
  }

  private async createSpecialty(specialty: SpecialtyCrawlData): Promise<void> {
    const newSpecialty = this.localSpecialty.create({
      name: specialty.name,
      description: specialty.description,
      season_info: specialty.seasonInfo,
      region: specialty.region,
      city: specialty.city,
      image: specialty.imageUrl,
    });

    await this.localSpecialty.save(newSpecialty);
    this.logger.log(`저장 ${specialty.name}, ${specialty.region}, ${specialty.city}`);
  }
}
