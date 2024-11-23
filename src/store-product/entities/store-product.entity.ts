// src/store-product/entities/store-product.entity.ts
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { Store } from 'src/store/entities/store.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StoreProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  store_id: number;

  @Column()
  product_id: number;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column()
  image: string;

  @ManyToOne(() => Store, (store) => store.storeProduct)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => CartItem, (cartItem) => cartItem.storeProduct)
  cartItem: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.storeProduct)
  orderItem: OrderItem[];

  @ManyToOne(() => Product, (product) => product.storeProduct)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
