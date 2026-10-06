import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ApiResponse } from '../../../core/models/api-response.model';
import { InventoryService } from '../../../core/services/inventory-service';
import { Pagination } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-inventory-report',
  imports: [CommonModule, FormsModule, Pagination],
  templateUrl: './inventory-report.html',
  styleUrl: './inventory-report.scss',
})
export class InventoryReport implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  search = '';

  inventories: any[] = [];

  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  loading = false;

  ngOnInit(): void {
    this.currentPage = 0;
    this.loadInventoryReport();
  }

  loadInventoryReport(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.inventoryService
      .getInventoryReport(this.search.trim(), this.currentPage, this.pageSize)
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.inventories = response.data?.content ?? [];

          this.totalPages = response.data?.totalPages ?? 0;

          this.totalElements = response.data?.totalElements ?? 0;

          this.loading = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Inventory report error:', error);

          this.inventories = [];
          this.totalPages = 0;
          this.totalElements = 0;

          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  searchReport(): void {
    this.currentPage = 0;

    this.loadInventoryReport();
  }

  clearFilters(): void {
    this.search = '';
    this.currentPage = 0;

    this.loadInventoryReport();
  }

  changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.currentPage = page;

    this.loadInventoryReport();
  }

  printReport(): void {
    window.print();
  }
}
