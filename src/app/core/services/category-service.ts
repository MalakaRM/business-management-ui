import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { Category, CategoryPage } from '../models/Category';
import { CategoryCreateRequest } from '../models/CategoryCreateRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  getAllCategories(page: number, size: number): Observable<ApiResponse<CategoryPage>> {
    return this.http.get<ApiResponse<CategoryPage>>(`${environment.apiUrl}/categories`, {
      params: {
        page,
        size,
      },
    });
  }

  createCategory(request: CategoryCreateRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${environment.apiUrl}/categories`, request);
  }

  getCategoryById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${environment.apiUrl}/categories/${id}`);
  }

  updateCategory(id: number, request: CategoryCreateRequest): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${environment.apiUrl}/categories/${id}`, request);
  }

  deactivateCategory(id: number): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(
      `${environment.apiUrl}/categories/${id}/deactivate`,
      {},
    );
  }
}
