import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';

import { Inventory, InventoryPage } from '../models/Inventory';
import { StockMovement } from '../models/StockMovement';

import { StockMovementRequest } from '../models/StockMovementRequest';
import { StockAdjustmentRequest } from '../models/StockAdjustmentRequest';
import { UpdateReorderLevelRequest } from '../models/UpdateReorderLevelRequest';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);

  getInventory(productId: number): Observable<ApiResponse<Inventory>> {
    return this.http.get<ApiResponse<Inventory>>(
      `${environment.apiUrl}/inventory/products/${productId}`,
    );
  }

  getLowStockProducts(): Observable<ApiResponse<Inventory[]>> {
    return this.http.get<ApiResponse<Inventory[]>>(`${environment.apiUrl}/inventory/low-stock`);
  }

  getStockMovements(productId: number): Observable<ApiResponse<StockMovement[]>> {
    return this.http.get<ApiResponse<StockMovement[]>>(
      `${environment.apiUrl}/inventory/products/${productId}/movements`,
    );
  }

  recordStockMovement(request: StockMovementRequest): Observable<ApiResponse<StockMovement>> {
    return this.http.post<ApiResponse<StockMovement>>(
      `${environment.apiUrl}/inventory/movements`,
      request,
    );
  }

  adjustStock(request: StockAdjustmentRequest): Observable<ApiResponse<StockMovement>> {
    return this.http.post<ApiResponse<StockMovement>>(
      `${environment.apiUrl}/inventory/adjustments`,
      request,
    );
  }

  updateReorderLevel(
    productId: number,
    request: UpdateReorderLevelRequest,
  ): Observable<ApiResponse<Inventory>> {
    return this.http.patch<ApiResponse<Inventory>>(
      `${environment.apiUrl}/inventory/products/${productId}/reorder-level`,
      request,
    );
  }
  getAllInventory(page: number, size: number): Observable<ApiResponse<InventoryPage>> {
    return this.http.get<ApiResponse<InventoryPage>>(`${environment.apiUrl}/inventory`, {
      params: {
        page,
        size,
      },
    });
  }
  getInventoryByProductId(productId: number): Observable<ApiResponse<Inventory>> {
    return this.http.get<ApiResponse<Inventory>>(
      `${environment.apiUrl}/inventory/products/${productId}`,
    );
  }
  getInventoryReport(search: string, page: number, size: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/inventory/report/inventory`, {
      params: {
        search,
        page,
        size,
      },
    });
  }

  getLowStockReport(
    search: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${environment.apiUrl}/inventory/report/low-stock`,
      {
        params: {
          search,
          page,
          size,
        },
      },
    );
  }
}
