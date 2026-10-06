import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SupplierService } from '../../../core/services/supplier-service';
import { Supplier } from '../../../core/models/Supplier';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './suppliers-list.html',
  styleUrl: './suppliers-list.scss',
})
export class SuppliersList implements OnInit {
  private readonly supplierService = inject(SupplierService);

  private readonly notificationService = inject(NotificationService);

  private readonly permissionService = inject(PermissionService);

  private readonly cdr = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';

  currentPage = 0;
  pageSize = 10;

  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (!this.hasPermission('SUPPLIER_READ')) {
      return;
    }

    this.loadSuppliers();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadSuppliers(): void {
    if (!this.hasPermission('SUPPLIER_READ')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.supplierService.getAllSuppliers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const pageData = response.data;

        this.suppliers = pageData.content;

        this.totalPages = pageData.totalPages;

        this.totalElements = pageData.totalElements;

        this.currentPage = pageData.number;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Suppliers loading failed:', error);

        this.suppliers = [];
        this.totalPages = 0;
        this.totalElements = 0;

        this.errorMessage =
          error?.error?.message || 'Suppliers could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (!this.hasPermission('SUPPLIER_READ')) {
      return;
    }

    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;

    this.loadSuppliers();
  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index,
    );
  }

  get filteredSuppliers(): Supplier[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.suppliers;
    }

    return this.suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        (supplier.email ?? '').toLowerCase().includes(term) ||
        (supplier.phone ?? '').toLowerCase().includes(term),
    );
  }

  deactivateSupplier(supplier: Supplier): void {
    if (!this.hasPermission('SUPPLIER_UPDATE')) {
      return;
    }

    if (!supplier.active) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to deactivate "${supplier.name}"?`);

    if (!confirmed) {
      return;
    }

    this.supplierService.deactivateSupplier(supplier.id).subscribe({
      next: () => {
        this.notificationService.success('Supplier deactivated successfully.');

        this.loadSuppliers();
      },

      error: (error) => {
        console.error('Supplier deactivation failed:', error);

        this.notificationService.error(
          error?.error?.message || 'Supplier could not be deactivated. Please try again.',
        );
      },
    });
  }
}
