export interface Supplier {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export interface SupplierPage {
  content: Supplier[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
