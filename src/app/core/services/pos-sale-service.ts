import { inject, Injectable } from '@angular/core';
import { PosSaleRequest } from '../models/PosSaleRequest';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PosSaleResponse } from '../models/PosSaleResponse';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PosSaleService {
  private readonly http = inject(HttpClient);

  completeSale(request: PosSaleRequest): Observable<ApiResponse<PosSaleResponse>> {
    return this.http.post<ApiResponse<PosSaleResponse>>(
      `${environment.apiUrl}/pos/complete-sale`,
      request,
    );
  }
}
