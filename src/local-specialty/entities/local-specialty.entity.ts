// src/local-specialty/entities/local-specialty.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Region } from '../types/region.type';
import { StoreProduct } from '../../store-product/entities/store-product.entity';
import { SpecialtySeason } from '../types/season.type';

@Entity('local_specialty')
export class LocalSpecialty {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'set',
    enum: SpecialtySeason,
    transformer: {
      to: (value: SpecialtySeason[]) => value?.join(',') || '',
      from: (value: string | null) => {
        if (!value) return [];
        return (typeof value === 'string' ? value.split(',') : value) as SpecialtySeason[];
      },
    },
  })
  season_info: SpecialtySeason[];

  @Column({ type: 'enum', enum: Region })
  region: Region;

  @Column({ type: 'varchar' })
  city: string;

  @Column({ nullable: true })
  image?: string;

  @OneToMany(() => StoreProduct, (storeProduct) => storeProduct.local_specialty)
  store_products: StoreProduct[];
}
