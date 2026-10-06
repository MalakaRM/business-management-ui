export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface RoleResponse {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface PermissionResponse {
  id: number;
  name: string;
  description: string;
}
