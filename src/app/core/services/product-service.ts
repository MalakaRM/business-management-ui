import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Product } from '../models/Product';
import { environment } from '../../../environments/environment';
import { ProductPage } from '../models/ProductPage';
import { ProductCreateRequest } from '../models/ProductCreateRequest';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  getAllProducts(page: number, size: number): Observable<ApiResponse<ProductPage>> {
    return this.http.get<ApiResponse<ProductPage>>(`${environment.apiUrl}/products`, {
      params: {
        page,
        size,
      },
    });
  }
  createProduct(request: ProductCreateRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${environment.apiUrl}/products`, request);
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`);
  }
  updateProduct(id: number, request: ProductCreateRequest): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`, request);
  }
  deactivateProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(
      `${environment.apiUrl}/products/${id}/deactivate`,
      {},
    );
  }
}
