export interface Inventory {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  reorderLevel: number;
  lowStock: boolean;
  active: boolean;
}

export interface InventoryPage {
  content: Inventory[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}


