import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { LocalSpecialty } from 'src/local-specialty/entities/local-specialty.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { Store } from 'src/store/entities/store.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class StoreProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  store_id: number;

  @Column()
  local_specialty_id: number;

  // 상품명
  @Column()
  product_name: string;

  @Column({ type: 'text' })
  description: string;

  // 프리미엄, 일반
  @Column({ default: '일반' })
  grade?: string;

  // 세트, 낱개
  @Column({ default: '낱개' })
  type?: string;

  // 무게
  @Column({ default: 0 })
  weight?: number;

  // 가격
  @Column()
  price: number;

  // 재고
  @Column({ default: 0 })
  stock: number;

  // 판매 여부
  @Column({ default: false })
  is_active: boolean;

  // 품절 여부
  @Column({ default: false })
  sold_out: boolean;

  // is_active가 true, sold_out가 true인 경우 판매 중 (하지만 품절되었기에 더 팔수 없음)
  // is_active가 true, sold_out가 false인 경우 판매 중 (정상 판매)
  // is_active가 false, sold_out가 true인 경우 판매 중지 (단순히 품절되어서 팔수 없음)
  // is_active가 false, sold_out가 false인 경우 판매 중지 (판매 중지 상태)

  // 이미지
  @Column()
  image?: string;

  @ManyToOne(() => Store, (store) => store.store_products)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => LocalSpecialty, (localSpecialty) => localSpecialty.store_products)
  @JoinColumn({ name: 'local_specialty_id' })
  local_specialty: LocalSpecialty;

  @OneToMany(() => CartItem, (cartItem) => cartItem.store_product)
  cart_items: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.store_product)
  order_items: OrderItem[];
}
