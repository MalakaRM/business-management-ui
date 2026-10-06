import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PurchaseService } from '../../../core/services/purchase-service';
import { PermissionService } from '../../../core/services/permission-service';

import {
  Purchase,
  PurchaseStatus,
} from '../../../core/models/Purchase';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './purchases-list.html',
  styleUrl: './purchases-list.scss',
})
export class PurchasesList implements OnInit {

  private readonly purchaseService =
    inject(PurchaseService);

  private readonly permissionService =
    inject(PermissionService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  purchases: Purchase[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  statusFilter: PurchaseStatus | '' = '';

  currentPage = 0;
  pageSize = 10;

  totalPages = 0;
  totalElements = 0;

  ngOnInit(): void {
    if (!this.hasPermission('PURCHASE_READ')) {
      return;
    }

    this.loadPurchases();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadPurchases(): void {
    if (!this.hasPermission('PURCHASE_READ')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.purchaseService
      .getAllPurchases(
        this.currentPage,
        this.pageSize,
      )
      .subscribe({

        next: (response) => {

          const pageData = response.data;

          this.purchases =
            pageData.content;

          this.totalPages =
            pageData.totalPages;

          this.totalElements =
            pageData.totalElements;

          this.currentPage =
            pageData.number;

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Purchases loading failed:',
            error,
          );

          this.purchases = [];
          this.totalPages = 0;
          this.totalElements = 0;

          this.errorMessage =
            error?.error?.message ||
            'Purchases could not be loaded. Please try again.';

          this.isLoading = false;

          this.cdr.detectChanges();
        },
      });
  }

  get filteredPurchases(): Purchase[] {

    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.purchases.filter(
      (purchase) => {

        const matchesSearch =
          !term ||
          purchase.referenceNumber
            .toLowerCase()
            .includes(term) ||
          purchase.supplierName
            .toLowerCase()
            .includes(term);

        const matchesStatus =
          !this.statusFilter ||
          purchase.status ===
          this.statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );
  }

  get draftCount(): number {
    return this.purchases.filter(
      (purchase) =>
        purchase.status === 'DRAFT',
    ).length;
  }

  get receivedCount(): number {
    return this.purchases.filter(
      (purchase) =>
        purchase.status === 'RECEIVED',
    ).length;
  }

  get cancelledCount(): number {
    return this.purchases.filter(
      (purchase) =>
        purchase.status === 'CANCELLED',
    ).length;
  }

  goToPage(page: number): void {

    if (
      !this.hasPermission('PURCHASE_READ')
    ) {
      return;
    }

    if (
      page < 0 ||
      page >= this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;

    this.loadPurchases();
  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index,
    );
  }

  getStatusLabel(
    status: PurchaseStatus,
  ): string {

    switch (status) {

      case 'DRAFT':
        return 'Draft';

      case 'RECEIVED':
        return 'Received';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }

  getStatusClass(
    status: PurchaseStatus,
  ): string {

    switch (status) {

      case 'DRAFT':
        return 'status-draft';

      case 'RECEIVED':
        return 'status-received';

      case 'CANCELLED':
        return 'status-cancelled';

      default:
        return '';
    }
  }

  protected readonly Math = Math;
}
