import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { OrderService } from '../../../core/services/order-service';
import { PosSaleService } from '../../../core/services/pos-sale-service';
import { PermissionService } from '../../../core/services/permission-service';

import { Order } from '../../../core/models/Order';
import { PaymentMethod } from '../../../core/models/PaymentMethod';
import { PosSaleRequest } from '../../../core/models/PosSaleRequest';
import { PosSaleResponse } from '../../../core/models/PosSaleResponse';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly posSaleService = inject(PosSaleService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  order: Order | null = null;
  orderId: number | null = null;

  paymentMethod: PaymentMethod = 'CASH';
  amountTendered = 0;

  paymentResult: PosSaleResponse | null = null;

  isLoadingOrder = false;
  isCompletingSale = false;

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    /*
     * Frontend permission check.
     * Payment page eka sale complete karana nisa
     * ORDER_CREATE permission eka required.
     */
    if (!this.hasPermission('ORDER_CREATE')) {
      this.errorMessage =
        'You do not have permission to complete sales.';
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

      this.orderId = orderId;

      this.loadOrder(orderId);
    });
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadOrder(orderId: number): void {
    if (!this.hasPermission('ORDER_READ')) {
      this.errorMessage =
        'You do not have permission to view this order.';
      return;
    }

    this.isLoadingOrder = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.amountTendered = 0;

    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.errorMessage =
            response.message || 'Unable to load order.';

          this.isLoadingOrder = false;

          this.cdr.detectChanges();

          return;
        }

        this.order = response.data;
        this.amountTendered = 0;

        this.isLoadingOrder = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Payment order loading failed:',
          error,
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to load order. Please try again.';

        this.isLoadingOrder = false;

        this.cdr.detectChanges();
      },
    });
  }

  get totalAmount(): number {
    if (!this.order) {
      return 0;
    }

    return Number(this.order.totalAmount ?? 0);
  }

  get changeAmount(): number {
    if (this.paymentMethod !== 'CASH') {
      return 0;
    }

    return Math.max(
      0,
      this.amountTendered - this.totalAmount,
    );
  }

  get remainingAmount(): number {
    return Math.max(
      0,
      this.totalAmount - this.amountTendered,
    );
  }

  get canCompletePayment(): boolean {
    if (
      !this.hasPermission('ORDER_CREATE') ||
      !this.orderId ||
      !this.order ||
      this.isCompletingSale
    ) {
      return false;
    }

    if (this.amountTendered < 0.01) {
      return false;
    }

    return this.amountTendered >= this.totalAmount;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    if (
      this.isCompletingSale ||
      !this.hasPermission('ORDER_CREATE')
    ) {
      return;
    }

    this.paymentMethod = method;

    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();
  }

  onAmountTenderedChange(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();
  }

  completeSale(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.errorMessage =
        'You do not have permission to complete sales.';
      return;
    }

    if (!this.orderId) {
      this.errorMessage = 'Order information is missing.';
      return;
    }

    if (!this.order) {
      this.errorMessage =
        'Order information is not loaded.';
      return;
    }

    if (this.isCompletingSale) {
      return;
    }

    if (
      !Number.isFinite(this.amountTendered) ||
      this.amountTendered < 0.01
    ) {
      this.errorMessage =
        'Please enter the amount received from the customer.';
      return;
    }

    if (this.amountTendered < this.totalAmount) {
      this.errorMessage =
        'Amount tendered cannot be less than the total amount.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.isCompletingSale = true;

    const request: PosSaleRequest = {
      orderId: this.orderId,
      paymentMethod: this.paymentMethod,
      amountTendered: this.amountTendered,
    };

    this.posSaleService.completeSale(request).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.errorMessage =
            response.message ||
            'Unable to complete sale.';

          this.isCompletingSale = false;

          this.cdr.detectChanges();

          return;
        }

        this.paymentResult = response.data;

        this.successMessage =
          `Sale completed successfully. Order #${response.data.orderNumber}`;

        this.isCompletingSale = false;

        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/app/pos/bill'], {
            queryParams: {
              orderId: response.data.orderId,
            },
          });
        }, 500);
      },

      error: (error) => {
        console.error(
          'POS sale completion failed:',
          error,
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to complete the sale. Please try again.';

        this.isCompletingSale = false;

        this.cdr.detectChanges();
      },
    });
  }

  backToPos(): void {
    if (this.isCompletingSale) {
      return;
    }

    this.router.navigate(['/app/pos']);
  }
}
