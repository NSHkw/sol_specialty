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
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import { SpecialtySeason } from '../types/season.type';

@Entity()
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

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @OneToMany(() => StoreProduct, (storeProduct) => storeProduct.local_specialty)
  store_products: StoreProduct[];
}
