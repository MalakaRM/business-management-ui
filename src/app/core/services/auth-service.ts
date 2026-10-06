import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { ChangePasswordRequest } from '../models/ChangePasswordRequest';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, request);
  }
  changePassword(request: ChangePasswordRequest): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>(
      `${environment.apiUrl}/auth/change-password`,
      request,
    );
  }
  hasRoleManagePermission(): boolean {
    const roles = JSON.parse(localStorage.getItem('roles') ?? '[]') as string[];

    return roles.includes('ADMIN');
  }
}
