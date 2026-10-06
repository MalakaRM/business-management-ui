import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiResponse } from '../../../core/models/api-response.model';
import { PurchasePage } from '../../../core/models/Purchase';
import { PurchaseService } from '../../../core/services/purchase-service';
import { Pagination } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-purchase-report',
  imports: [CommonModule, FormsModule, Pagination],
  templateUrl: './purchase-report.html',
  styleUrl: './purchase-report.scss',
})
export class PurchaseReport implements OnInit {
  private readonly purchaseService = inject(PurchaseService);
  private readonly cdr = inject(ChangeDetectorRef);

  fromDate = '';
  toDate = '';
  search = '';

  purchases: any[] = [];

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

    this.loadPurchaseReport();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadPurchaseReport(): void {
    if (this.fromDate && this.toDate && this.fromDate > this.toDate) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.purchaseService
      .getPurchaseReport(
        this.fromDate,
        this.toDate,
        this.search.trim(),
        this.currentPage,
        this.pageSize,
      )
      .subscribe({
        next: (response: ApiResponse<PurchasePage>) => {
          this.purchases = response.data?.content ?? [];
          this.totalPages = response.data?.totalPages ?? 0;
          this.totalElements = response.data?.totalElements ?? 0;

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Purchase report error:', error);

          this.purchases = [];
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
    this.loadPurchaseReport();
  }

  clearFilters(): void {
    const today = new Date();

    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.fromDate = this.formatDate(firstDay);
    this.toDate = this.formatDate(today);
    this.search = '';

    this.currentPage = 0;

    this.loadPurchaseReport();
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.loadPurchaseReport();
  }

  printReport(): void {
    window.print();
  }
}
