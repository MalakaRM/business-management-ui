import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Invoice } from '../models/Invoice';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly http = inject(HttpClient);

  createInvoice(orderId: number): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(
      `${environment.apiUrl}/invoices/orders/${orderId}`,
      {},
    );
  }

  getInvoiceByOrderId(orderId: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${environment.apiUrl}/invoices/orders/${orderId}`);
  }
}
