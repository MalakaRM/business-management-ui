import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateUserRequest, CreateUserResponse } from '../models/user';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  createUser(request: CreateUserRequest): Observable<ApiResponse<CreateUserResponse>> {
    return this.http.post<ApiResponse<CreateUserResponse>>(`${environment.apiUrl}/users`, request);
  }
}
