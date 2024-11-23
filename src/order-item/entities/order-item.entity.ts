// src/order/entities/order-item.entity.ts

import { Order } from 'src/order/entities/order.entity';
import { StoreProduct } from 'src/store-product/entities/store-product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  store_product_id: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Order, (order) => order.orderItem)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => StoreProduct, (storeProduct) => storeProduct.orderItem)
  storeProduct: StoreProduct;
}
