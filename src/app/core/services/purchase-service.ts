import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { ApiResponse } from '../models/api-response.model';
import { PurchaseCreateRequest } from '../models/PurchaseCreateRequest';
import { Purchase, PurchasePage } from '../models/Purchase';





@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private readonly http = inject(HttpClient);

  createPurchase(request: PurchaseCreateRequest): Observable<ApiResponse<Purchase>> {
    return this.http.post<ApiResponse<Purchase>>(`${environment.apiUrl}/purchases`, request);
  }

  getAllPurchases(page: number, size: number): Observable<ApiResponse<PurchasePage>> {
    return this.http.get<ApiResponse<PurchasePage>>(`${environment.apiUrl}/purchases`, {
      params: {
        page,
        size,
      },
    });
  }

  getPurchaseById(id: number): Observable<ApiResponse<Purchase>> {
    return this.http.get<ApiResponse<Purchase>>(`${environment.apiUrl}/purchases/${id}`);
  }

  receivePurchase(id: number): Observable<ApiResponse<Purchase>> {
    return this.http.patch<ApiResponse<Purchase>>(
      `${environment.apiUrl}/purchases/${id}/receive`,
      {},
    );
  }
  cancelPurchase(id: number): Observable<ApiResponse<Purchase>> {
    return this.http.patch<ApiResponse<Purchase>>(
      `${environment.apiUrl}/purchases/${id}/cancel`,
      {},
    );
  }
  updatePurchase(id: number, request: PurchaseCreateRequest): Observable<ApiResponse<Purchase>> {
    return this.http.put<ApiResponse<Purchase>>(`${environment.apiUrl}/purchases/${id}`, request);
  }
  getPurchaseReport(
    from: string,
    to: string,
    search: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<PurchasePage>> {
    return this.http.get<ApiResponse<PurchasePage>>(
      `${environment.apiUrl}/purchases/report/purchases`,
      {
        params: {
          from,
          to,
          search,
          page,
          size,
        },
      },
    );
  }
}
