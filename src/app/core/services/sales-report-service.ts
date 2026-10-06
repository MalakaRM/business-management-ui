import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { MonthlyAmount } from '../models/MonthlyAmount';


@Injectable({
  providedIn: 'root',
})
export class SalesReportService {
  private readonly http = inject(HttpClient);

  getMonthlySales(from: string, to: string): Observable<ApiResponse<MonthlyAmount[]>> {
    return this.http.get<ApiResponse<MonthlyAmount[]>>(
      `${environment.apiUrl}/reports/sales/monthly`,
      {
        params: {
          from, to,
        },
      },
    );
  }
}
