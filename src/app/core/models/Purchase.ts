import { PurchaseItem } from './PurchaseItem';


export interface Purchase {
  id: number;
  referenceNumber: string;
  supplierId: number;
  supplierName: string;
  purchaseDate: string;
  status: PurchaseStatus;
  totalAmount: number;
  notes: string | null;
  items: PurchaseItem[];
}

export type PurchaseStatus = 'DRAFT' | 'RECEIVED' | 'CANCELLED';

export interface PurchasePage {
  content: Purchase[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
