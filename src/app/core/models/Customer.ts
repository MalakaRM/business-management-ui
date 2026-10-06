export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export interface CustomerPage {
  content: Customer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
