import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ShipStatus {
  DELIVERY_COMPLETED = '배송 완료',
  SHIPPING = '배송 중',
  SHIP_WAITING = '배송 대기',
  ORDER_COMPLETED = '주문 완료',
}
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar', enum: ShipStatus }) // 실제 타입은 enum이지만 테스트를 위해 타입을 text로 변경
  status: ShipStatus;

  @Column()
  order_address: string;

  @Column()
  order_method: string;

  @Column()
  total_cash: number;

  @Column()
  order_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.order)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  order_items: OrderItem[];
}
