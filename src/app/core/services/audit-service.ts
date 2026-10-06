import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuditLogPage } from '../models/audit';


@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly http = inject(HttpClient);

  getAuditLogs(page: number = 0, size: number = 20): Observable<ApiResponse<AuditLogPage>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<ApiResponse<AuditLogPage>>(`${environment.apiUrl}/audit-logs`, { params });
  }

  getByUsername(
    username: string,
    page: number = 0,
    size: number = 20,
  ): Observable<ApiResponse<AuditLogPage>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<ApiResponse<AuditLogPage>>(
      `${environment.apiUrl}/audit-logs/user/${encodeURIComponent(username)}`,
      { params },
    );
  }

  getByEntityName(
    entityName: string,
    page: number = 0,
    size: number = 20,
  ): Observable<ApiResponse<AuditLogPage>> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<ApiResponse<AuditLogPage>>(
      `${environment.apiUrl}/audit-logs/entity/${encodeURIComponent(entityName)}`,
      { params },
    );
  }
}
