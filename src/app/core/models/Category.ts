export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface CategoryPage {
  content: Category[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
