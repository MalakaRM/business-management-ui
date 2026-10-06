import { PaymentMethod } from './PaymentMethod';

export interface PosSaleResponse {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  paymentId: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  totalAmount: number;
  amountTendered: number;
  changeAmount: number;
}
