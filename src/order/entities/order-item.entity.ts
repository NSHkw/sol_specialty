// src/order/entities/order-item.entity.ts
import { Order } from '../../order/entities/order.entity';
import { StoreProduct } from '../../store-product/entities/store-product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('order_item')
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  order_id: number;

  @Column({ type: 'int', unsigned: true })
  store_product_id: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Order, (order) => order.order_items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => StoreProduct, (storeProduct) => storeProduct.order_items)
  @JoinColumn({ name: 'store_product_id' })
  store_product: StoreProduct;
}
