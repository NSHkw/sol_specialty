// src/order/interfaces/order.interface.ts

export interface OrderInterface {
  createDirectOrder();
  createCartOrder();
  pay();
  findAllOrder();
  findOneDetailOrder();
  getOrderStatus();
  cancelOrder();
}
