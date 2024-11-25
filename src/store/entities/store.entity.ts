import { Review } from 'src/review/entities/review.entity';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unsigned: true })
  user_id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  address?: string;

  @Column()
  contact?: string;

  @Column()
  image?: string;

  @Column({ default: 0 })
  review_count: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column()
  longitude?: number;

  @Column()
  latitude?: number;

  @Column({ default: 0 })
  total_sales: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @OneToOne(() => User, (user) => user.store)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Review, (review) => review.store)
  reviews: Review[];

  @OneToMany(() => StoreProduct, (storeProduct) => storeProduct.store)
  store_products: StoreProduct[];
}
