// src/store/entities/store.entity.ts
import { Review } from '../../review/entities/review.entity';
import { StoreProduct } from '../../store-product/entities/store-product.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('store')
export class Store {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ unsigned: true, type: 'int' })
  user_id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  contact?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: 0, type: 'bigint' })
  review_count: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ nullable: true, type: 'float' })
  longitude?: number;

  @Column({ nullable: true, type: 'float' })
  latitude?: number;

  @Column({ default: 0, type: 'bigint' })
  total_sales: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date;

  @OneToOne(() => User, (user) => user.store, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Review, (review) => review.store)
  reviews: Review[];

  @OneToMany(() => StoreProduct, (storeProduct) => storeProduct.store)
  store_products: StoreProduct[];
}
