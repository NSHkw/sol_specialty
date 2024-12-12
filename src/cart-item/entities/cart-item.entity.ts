import { StoreProduct } from '../../store-product/entities/store-product.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cart_item')
export class CartItem {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true })
  user_id: number;

  @Column({ type: 'int', unsigned: true })
  store_product_id: number;

  @Column({ type: 'int', unsigned: true })
  quantity: number;

  @ManyToOne(() => User, (user) => user.cart_items)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StoreProduct, (storeProduct) => storeProduct.cart_items)
  @JoinColumn({ name: 'store_product_id' })
  store_product: StoreProduct;
}
