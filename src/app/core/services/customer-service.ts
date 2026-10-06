import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { Customer, CustomerPage } from '../models/Customer';
import { CustomerCreateRequest } from '../models/CustomerCreateRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);

  getAllCustomers(page: number, size: number): Observable<ApiResponse<CustomerPage>> {
    return this.http.get<ApiResponse<CustomerPage>>(`${environment.apiUrl}/customers`, {
      params: {
        page,
        size,
      },
    });
  }

  createCustomer(request: CustomerCreateRequest): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${environment.apiUrl}/customers`, request);
  }

  getCustomerById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${environment.apiUrl}/customers/${id}`);
  }

  updateCustomer(id: number, request: CustomerCreateRequest): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${environment.apiUrl}/customers/${id}`, request);
  }

  deactivateCustomer(id: number): Observable<ApiResponse<Customer>> {
    return this.http.patch<ApiResponse<Customer>>(
      `${environment.apiUrl}/customers/${id}/deactivate`,
      {},
    );
  }
}
