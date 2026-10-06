import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CreateRoleRequest, PermissionResponse, RoleResponse } from '../models/role-management';


@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly http = inject(HttpClient);

  createRole(request: CreateRoleRequest): Observable<ApiResponse<RoleResponse>> {
    return this.http.post<ApiResponse<RoleResponse>>(`${environment.apiUrl}/roles`, request);
  }

  getAllRoles(): Observable<ApiResponse<RoleResponse[]>> {
    return this.http.get<ApiResponse<RoleResponse[]>>(`${environment.apiUrl}/roles`);
  }

  getAllPermissions(): Observable<ApiResponse<PermissionResponse[]>> {
    return this.http.get<ApiResponse<PermissionResponse[]>>(`${environment.apiUrl}/permissions`);
  }

  assignPermissions(
    roleId: number,
    permissionIds: number[],
  ): Observable<ApiResponse<RoleResponse>> {
    return this.http.put<ApiResponse<RoleResponse>>(
      `${environment.apiUrl}/roles/${roleId}/permissions`,
      permissionIds,
    );
  }
}
