import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuditService } from '../../../core/services/audit-service';
import { PermissionService } from '../../../core/services/permission-service';

import { AuditLog as AuditLogModel, AuditLogPage } from '../../../core/models/audit';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLog implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  auditLogs: AuditLogModel[] = [];

  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  selectedUsername = '';
  selectedEntity = '';

  isLoading = false;
  errorMessage = '';

  // =========================================================
  // PERMISSION
  // =========================================================

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  get canReadAuditLogs(): boolean {
    return this.hasPermission('AUDIT_READ');
  }

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    if (!this.canReadAuditLogs) {
      this.errorMessage = 'You do not have permission to view audit logs.';
      return;
    }

    this.loadAuditLogs();
  }

  // =========================================================
  // LOAD
  // =========================================================

  loadAuditLogs(): void {
    if (!this.canReadAuditLogs) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const username = this.selectedUsername.trim();
    const entityName = this.selectedEntity.trim();

    if (username) {
      this.loadByUsername(username);
      return;
    }

    if (entityName) {
      this.loadByEntityName(entityName);
      return;
    }

    this.loadAll();
  }

  private loadAll(): void {
    this.auditService.getAuditLogs(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.setPageData(response.data);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  private loadByUsername(username: string): void {
    this.auditService.getByUsername(username, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.setPageData(response.data);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  private loadByEntityName(entityName: string): void {
    this.auditService.getByEntityName(entityName, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.setPageData(response.data);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  // =========================================================
  // PAGE DATA
  // =========================================================

  private setPageData(pageData: AuditLogPage): void {
    this.auditLogs = pageData.content;

    this.currentPage = pageData.number;
    this.totalPages = pageData.totalPages;
    this.totalElements = pageData.totalElements;

    this.isLoading = false;

    this.cdr.detectChanges();
  }

  // =========================================================
  // ERROR
  // =========================================================

  private handleError(error: any): void {
    console.error('Audit logs loading failed:', error);

    this.auditLogs = [];
    this.totalPages = 0;
    this.totalElements = 0;

    this.errorMessage =
      error?.error?.message || 'Audit logs could not be loaded. Please try again.';

    this.isLoading = false;

    this.cdr.detectChanges();
  }

  // =========================================================
  // FILTERS
  // =========================================================

  applyFilters(): void {
    if (!this.canReadAuditLogs) {
      return;
    }

    this.currentPage = 0;
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.selectedUsername = '';
    this.selectedEntity = '';
    this.currentPage = 0;

    this.loadAuditLogs();
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadAuditLogs();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index);
  }
}

export default AuditLog;
