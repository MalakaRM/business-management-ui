import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { InvoiceService } from '../../../core/services/invoice-service';
import { Invoice } from '../../../core/models/Invoice';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bill.html',
  styleUrl: './bill.scss',
})
export class Bill implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly invoiceService = inject(InvoiceService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  invoice: Invoice | null = null;

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (!this.hasPermission('ORDER_READ')) {
      this.errorMessage = 'You do not have permission to view this bill.';
      return;
    }

    this.route.queryParamMap.subscribe((params) => {
      const orderIdParam = params.get('orderId');

      if (!orderIdParam) {
        this.errorMessage = 'Order information is missing.';
        return;
      }

      const orderId = Number(orderIdParam);

      if (!Number.isInteger(orderId) || orderId <= 0) {
        this.errorMessage = 'Invalid order information.';
        return;
      }

      this.loadInvoice(orderId);
    });
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadInvoice(orderId: number): void {
    if (!this.hasPermission('ORDER_READ')) {
      this.errorMessage = 'You do not have permission to view this bill.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoiceByOrderId(orderId).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.errorMessage = response.message || 'Unable to load invoice.';

          this.isLoading = false;

          this.cdr.detectChanges();

          return;
        }

        this.invoice = response.data;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Invoice loading failed:', error);

        this.errorMessage = error?.error?.message || 'Unable to load invoice. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  get customerName(): string {
    return 'Walk-in Customer';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  printBill(): void {
    if (!this.hasPermission('ORDER_READ')) {
      return;
    }

    window.print();
  }

  newSale(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.router.navigate(['/app/pos']);
      return;
    }

    this.router.navigate(['/app/pos']);
  }

  backToPos(): void {
    this.router.navigate(['/app/pos']);
  }
}
