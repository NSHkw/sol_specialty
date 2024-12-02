import { OrderItem } from 'src/order/entities/order-item.entity';
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
  ORDER_CANCELLED = '주문 취소',
  PAYMENT_WAITING = '결제 대기',
}

export enum OrderMethod {
  DELIVERY = '일반 택배',
  PICKUP = '직접 수령',
  POST_OFFICE = '우체국 택배',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @Column({ type: 'varchar', enum: ShipStatus, default: ShipStatus.PAYMENT_WAITING }) // 실제 타입은 enum이지만 테스트를 위해 타입을 text로 변경
  status: ShipStatus;

  @Column({ type: 'varchar' })
  order_address: string;

  @Column({ type: 'varchar', enum: OrderMethod }) // 실제 타입은 enum이지만 테스트를 위해 타입을 text로 변경
  order_method: OrderMethod;

  @Column({ type: 'bigint', default: 0 })
  total_cash: number;

  @Column({ type: 'datetime' })
  order_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at?: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  order_items: OrderItem[];
}
