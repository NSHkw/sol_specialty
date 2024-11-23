// src/local-specialty/entities/local-specialty.entity.ts
import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from '../types/region.type';

@Entity()
export class LocalSpecialty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  season_info: string;

  @Column({ type: 'varchar', enum: Region }) // 실제 타입은 enum이지만 테스트를 위해 타입을 text로 변경
  region: Region;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => Product, (product) => product.localSpecialty)
  product: Product[];
}
