export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  description: string;
  active: boolean;
  categoryId: number;
  categoryName: string;
}
