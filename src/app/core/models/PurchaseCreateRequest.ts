export interface PurchaseCreateRequest {
  referenceNumber: string;
  supplierId: number;
  purchaseDate: string;
  notes: string;
  items: PurchaseItemRequest[];
}

export interface PurchaseItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}
