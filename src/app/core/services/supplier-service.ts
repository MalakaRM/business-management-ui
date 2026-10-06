import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { Supplier, SupplierPage } from '../models/Supplier';
import { SupplierCreateRequest } from '../models/SupplierCreateRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private readonly http = inject(HttpClient);

  getAllSuppliers(page: number, size: number): Observable<ApiResponse<SupplierPage>> {
    return this.http.get<ApiResponse<SupplierPage>>(`${environment.apiUrl}/suppliers`, {
      params: {
        page,
        size,
      },
    });
  }

  createSupplier(request: SupplierCreateRequest): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(`${environment.apiUrl}/suppliers`, request);
  }

  getSupplierById(id: number): Observable<ApiResponse<Supplier>> {
    return this.http.get<ApiResponse<Supplier>>(`${environment.apiUrl}/suppliers/${id}`);
  }

  updateSupplier(id: number, request: SupplierCreateRequest): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${environment.apiUrl}/suppliers/${id}`, request);
  }

  deactivateSupplier(id: number): Observable<ApiResponse<Supplier>> {
    return this.http.patch<ApiResponse<Supplier>>(
      `${environment.apiUrl}/suppliers/${id}/deactivate`,
      {},
    );
  }
}
