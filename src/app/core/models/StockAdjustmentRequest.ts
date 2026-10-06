export interface StockAdjustmentRequest {
  productId: number;
  newQuantity: number;
  reason: string;
}
