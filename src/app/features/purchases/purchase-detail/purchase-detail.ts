import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';

import { PurchaseService } from '../../../core/services/purchase-service';
import { PermissionService } from '../../../core/services/permission-service';

import { Purchase, PurchaseStatus } from '../../../core/models/Purchase';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-detail.html',
  styleUrl: './purchase-detail.scss',
})
export class PurchaseDetail implements OnInit {
  private readonly purchaseService = inject(PurchaseService);

  private readonly permissionService = inject(PermissionService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  purchase: Purchase | null = null;

  purchaseId: number | null = null;

  isLoading = false;
  isReceiving = false;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (!this.hasPermission('PURCHASE_READ')) {
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/app/purchases']);
      return;
    }

    const numericId = Number(id);

    if (Number.isNaN(numericId) || numericId <= 0) {
      this.router.navigate(['/app/purchases']);
      return;
    }

    this.purchaseId = numericId;

    this.loadPurchase();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  canUpdate(): boolean {
    return this.hasPermission('PURCHASE_UPDATE');
  }

  canDelete(): boolean {
    return this.hasPermission('PURCHASE_DELETE');
  }

  private loadPurchase(): void {
    if (this.purchaseId === null || !this.hasPermission('PURCHASE_READ')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.purchaseService.getPurchaseById(this.purchaseId).subscribe({
      next: (response) => {
        this.purchase = response.data;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Purchase details loading failed:', error);

        this.purchase = null;

        this.errorMessage =
          error?.error?.message || 'Purchase details could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  receivePurchase(): void {
    if (!this.hasPermission('PURCHASE_UPDATE')) {
      return;
    }

    if (
      this.purchaseId === null ||
      !this.purchase ||
      this.purchase.status !== 'DRAFT' ||
      this.isReceiving
    ) {
      return;
    }

    this.isReceiving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.purchaseService.receivePurchase(this.purchaseId).subscribe({
      next: (response) => {
        this.purchase = response.data;

        this.isReceiving = false;

        this.successMessage = 'Purchase received successfully. Inventory has been updated.';

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Purchase receiving failed:', error);

        this.isReceiving = false;

        this.errorMessage =
          error?.error?.message || 'Purchase could not be received. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  cancelPurchase(): void {
    if (!this.hasPermission('PURCHASE_DELETE')) {
      return;
    }

    if (
      this.purchaseId === null ||
      !this.purchase ||
      this.purchase.status !== 'DRAFT' ||
      this.isReceiving
    ) {
      return;
    }

    this.isReceiving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.purchaseService.cancelPurchase(this.purchaseId).subscribe({
      next: (response) => {
        this.purchase = response.data;

        this.isReceiving = false;

        this.successMessage = 'Purchase cancelled successfully.';

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Purchase cancellation failed:', error);

        this.isReceiving = false;

        this.errorMessage =
          error?.error?.message || 'Purchase could not be cancelled. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/purchases']);
  }

  getStatusLabel(status: PurchaseStatus): string {
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

  getStatusClass(status: PurchaseStatus): string {
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
}
