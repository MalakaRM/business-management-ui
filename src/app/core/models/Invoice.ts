import { PaymentMethod } from './PaymentMethod';
import { OrderItem } from './OrderItem';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  orderNumber: string;
  issuedAt: string;
  cashierName: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  changeAmount: number;
  items: OrderItem[];
}
