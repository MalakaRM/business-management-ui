export interface PosSaleRequest {
  orderId: number;
  paymentMethod: 'CASH' | 'CARD';
  amountTendered: number;
}
