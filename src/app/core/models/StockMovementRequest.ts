import { StockMovementType } from './StockMovement';

export interface StockMovementRequest {
  productId: number;
  type: StockMovementType;
  quantity: number;
  reason: string;
}

