export interface OrderCreateRequest {
  orderNumber: string;
  customerId: number | null;
  orderDate: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}
