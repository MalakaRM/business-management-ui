export interface ProductCreateRequest {
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  description: string;
  categoryId: number;
}
