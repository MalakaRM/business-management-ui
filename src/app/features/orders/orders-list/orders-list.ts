import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OrderService } from '../../../core/services/order-service';
import { PermissionService } from '../../../core/services/permission-service';

import { Order, OrderStatus } from '../../../core/models/Order';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './orders-list.html',
  styleUrl: './orders-list.scss',
})
export class OrdersList implements OnInit {
  private readonly orderService = inject(OrderService);

  private readonly permissionService = inject(PermissionService);

  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly Math = Math;

  orders: Order[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';

  statusFilter: OrderStatus | '' = '';

  currentPage = 0;
  pageSize = 10;

  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (!this.hasPermission('ORDER_READ')) {
      return;
    }

    this.loadOrders();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadOrders(): void {
    if (!this.hasPermission('ORDER_READ')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getAllOrders(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const pageData = response.data;

        this.orders = pageData.content;

        this.totalPages = pageData.totalPages;

        this.totalElements = pageData.totalElements;

        this.currentPage = pageData.number;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Orders loading failed:', error);

        this.orders = [];
        this.totalPages = 0;
        this.totalElements = 0;

        this.errorMessage =
          error?.error?.message || 'Orders could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  get filteredOrders(): Order[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        (order.customerName && order.customerName.toLowerCase().includes(term));

      const matchesStatus = !this.statusFilter || order.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  get pendingCount(): number {
    return this.orders.filter((order) => order.status === 'PENDING').length;
  }

  get confirmedCount(): number {
    return this.orders.filter((order) => order.status === 'CONFIRMED').length;
  }

  get cancelledCount(): number {
    return this.orders.filter((order) => order.status === 'CANCELLED').length;
  }

  goToPage(page: number): void {
    if (!this.hasPermission('ORDER_READ')) {
      return;
    }

    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;

    this.loadOrders();
  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index,
    );
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';

      case 'CONFIRMED':
        return 'Confirmed';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';

      case 'CONFIRMED':
        return 'status-confirmed';

      case 'CANCELLED':
        return 'status-cancelled';

      default:
        return '';
    }
  }
}
