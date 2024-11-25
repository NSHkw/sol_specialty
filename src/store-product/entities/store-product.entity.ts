import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { LocalSpecialty } from 'src/local-specialty/entities/local-specialty.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
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
  product_Name: string;

  // 프리미엄, 일반
  @Column()
  grade: string;

  // 세트, 낱개
  @Column()
  type: string;

  // 무게
  @Column()
  weight: number;

  // 가격
  @Column()
  price: number;

  // 재고
  @Column()
  stock: number;

  // 판매 여부
  @Column()
  is_active: boolean;

  // 이미지
  @Column()
  image: string;

  @ManyToOne(() => Store, (store) => store.storeProducts)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => LocalSpecialty, (localSpecialty) => localSpecialty.storeProducts)
  @JoinColumn({ name: 'local_specialty_id' })
  local_specialty: LocalSpecialty;

  @OneToMany(() => CartItem, (cartItem) => cartItem.storeProduct)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.storeProduct)
  orderItems: OrderItem[];
}
