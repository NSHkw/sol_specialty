import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { Order } from 'src/order/entities/order.entity';
import { Review } from 'src/review/entities/review.entity';
import { Store } from 'src/store/entities/store.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: 0 })
  cash: number;

  @Column({ type: 'varchar', enum: UserRole, default: UserRole.CUSTOMER }) // 실제 타입은 enum이지만 테스트를 위해 타입을 text로 변경
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @OneToOne(() => Store, (store) => store.user, { onDelete: 'CASCADE' })
  store: Store;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cart_items: CartItem[];
}
