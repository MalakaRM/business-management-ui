import { AuditAction } from './audit-action';


export interface AuditLog {
  id: number;
  username: string;
  action: AuditAction;
  entityName: string;
  entityId: string | null;
  description: string | null;
  createdAt: string;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
