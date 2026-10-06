import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../models/api-response.model';
import { Observable } from 'rxjs';
import { Order, OrderPage } from '../models/Order';
import { environment } from '../../../environments/environment';
import { OrderCreateRequest } from '../models/OrderCreateRequest';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  createOrder(request: OrderCreateRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${environment.apiUrl}/orders`, request);
  }

  updateOrder(id: number, request: OrderCreateRequest): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${environment.apiUrl}/orders/${id}`, request);
  }

  getAllOrders(page: number, size: number): Observable<ApiResponse<OrderPage>> {
    return this.http.get<ApiResponse<OrderPage>>(`${environment.apiUrl}/orders`, {
      params: {
        page,
        size,
      },
    });
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${environment.apiUrl}/orders/${id}`);
  }

  confirmOrder(id: number): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${environment.apiUrl}/orders/${id}/confirm`, {});
  }

  cancelOrder(id: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${environment.apiUrl}/orders/${id}/cancel`, {});
  }

  getSalesReport(
    from: string,
    to: string,
    search: string,
    page: number,
    size: number,
  ): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('search', search)
      .set('page', page)
      .set('size', size);

    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/orders/report/sales`, { params });
  }
}
