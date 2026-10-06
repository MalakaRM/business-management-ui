import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CustomerService } from '../../../core/services/customer-service';
import { Customer } from '../../../core/models/Customer';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './customers-list.html',
  styleUrl: './customers-list.scss',
})
export class CustomersList implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly notificationService = inject(NotificationService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  customers: Customer[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';

  currentPage = 0;
  pageSize = 10;

  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (!this.hasPermission('CUSTOMER_READ')) {
      this.errorMessage = 'You do not have permission to view customers.';
      return;
    }

    this.loadCustomers();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadCustomers(): void {
    if (!this.hasPermission('CUSTOMER_READ')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getAllCustomers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const pageData = response.data;

        this.customers = pageData.content;
        this.totalPages = pageData.totalPages;
        this.totalElements = pageData.totalElements;
        this.currentPage = pageData.number;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Customers loading failed:', error);

        this.customers = [];
        this.totalPages = 0;
        this.totalElements = 0;

        this.errorMessage =
          error?.error?.message || 'Customers could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadCustomers();
  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index,
    );
  }

  get filteredCustomers(): Customer[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.customers;
    }

    return this.customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        (customer.email ?? '').toLowerCase().includes(term) ||
        (customer.phone ?? '').toLowerCase().includes(term),
    );
  }

  deactivateCustomer(customer: Customer): void {
    if (!this.hasPermission('CUSTOMER_UPDATE')) {
      this.notificationService.error('You do not have permission to deactivate customers.');

      return;
    }

    if (!customer.active) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to deactivate "${customer.name}"?`);

    if (!confirmed) {
      return;
    }

    this.customerService.deactivateCustomer(customer.id).subscribe({
      next: () => {
        this.notificationService.success('Customer deactivated successfully.');

        this.loadCustomers();
      },

      error: (error) => {
        console.error('Customer deactivation failed:', error);

        this.notificationService.error(
          error?.error?.message || 'Customer could not be deactivated. Please try again.',
        );
      },
    });
  }
}
