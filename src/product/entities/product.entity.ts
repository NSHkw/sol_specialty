// src/product/entities/product.entity.ts

import { LocalSpecialty } from 'src/local-specialty/entities/local-specialty.entity';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  local_specialty_id: number;

  @Column()
  name: number;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column()
  image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToMany(() => StoreProduct, (storeProduct) => storeProduct.product)
  storeProduct: StoreProduct[];

  @ManyToOne(() => LocalSpecialty, (localSpecialty) => localSpecialty.product)
  @JoinColumn({ name: 'local_specialty_id' })
  localSpecialty: LocalSpecialty;
}
