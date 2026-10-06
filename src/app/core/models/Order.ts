import { OrderItem } from './OrderItem';

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string | null;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface OrderPage {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
