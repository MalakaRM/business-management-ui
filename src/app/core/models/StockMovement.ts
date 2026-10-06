export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string | null;
  createdAt: string;
}

export type StockMovementType = 'PURCHASE' | 'SALE' | 'DAMAGE' | 'ADJUSTMENT';
