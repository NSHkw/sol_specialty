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
  Index,
} from 'typeorm';

@Entity()
@Index(['name', 'deleted_at'], { unique: true }) // 복합 인덱스
// deleted_at이 존재하는 name을 유니크하게 만드는 것 (소프트 삭제된 상점의 이름을 사용 못하게 되는 경우가 존재해서 만든 인덱스)
export class Store {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ unsigned: true, unique: true, type: 'int' })
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

  // precision: 전체 자릿수(소수점 앞부터 뒤까지), scale: 소수점 자릿수, decimal 타입이라 service에서 number 타입으로 바꿔야 함
  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  // 위도와 경도 (원래는 address를 통해 위도와 경도를 추출하는 방식을 생각했지만, 아직 그 기능을 구현하진 못했음)
  @Column({ nullable: true, type: 'float' })
  longitude?: number;

  @Column({ nullable: true, type: 'float' })
  latitude?: number;

  // 총 판매량 (총 판매량 조회 기능은 아직 구현 X)
  @Column({ default: 0, type: 'bigint' })
  total_sales: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @OneToOne(() => User, (user) => user.store, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' }) // 관계 설정 시 어떤 컬럼을 외래 키로 설정할 지
  user: User;

  @OneToMany(() => Review, (review) => review.store)
  reviews: Review[];

  @OneToMany(() => StoreProduct, (storeProduct) => storeProduct.store)
  store_products: StoreProduct[];
}
