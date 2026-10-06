import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiResponse } from '../../../core/models/api-response.model';
import { OrderService } from '../../../core/services/order-service';
import { Pagination } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-sales-report',
  imports: [CommonModule, FormsModule, Pagination],
  templateUrl: './sales-report.html',
  styleUrl: './sales-report.scss',
})
export class SalesReport implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly cdr = inject(ChangeDetectorRef);

  fromDate = '';
  toDate = '';
  search = '';

  orders: any[] = [];

  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  loading = false;

  ngOnInit(): void {
    const today = new Date();

    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.fromDate = this.formatDate(firstDay);
    this.toDate = this.formatDate(today);

    this.currentPage = 0;

    this.loadSalesReport();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadSalesReport(): void {
    // Validate only when both dates are provided.
    if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.orderService
      .getSalesReport(
        this.fromDate,
        this.toDate,
        this.search.trim(),
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.orders = response.data?.content ?? [];
          this.totalPages = response.data?.totalPages ?? 0;
          this.totalElements = response.data?.totalElements ?? 0;

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Sales report error:', error);

          this.orders = [];
          this.totalPages = 0;
          this.totalElements = 0;

          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  searchReport(): void {
    if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
      return;
    }

    this.currentPage = 0;
    this.loadSalesReport();
  }

  clearFilters(): void {
    const today = new Date();

    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.fromDate = this.formatDate(firstDay);
    this.toDate = this.formatDate(today);
    this.search = '';

    this.currentPage = 0;

    this.loadSalesReport();
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.loadSalesReport();
  }

  printReport(): void {
    window.print();
  }
}
