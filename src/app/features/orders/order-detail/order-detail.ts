import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';

import { forkJoin } from 'rxjs';

import { OrderService } from '../../../core/services/order-service';
import { InventoryService } from '../../../core/services/inventory-service';
import { PermissionService } from '../../../core/services/permission-service';

import { Order, OrderStatus } from '../../../core/models/Order';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit {
  private readonly orderService = inject(OrderService);

  private readonly inventoryService = inject(InventoryService);

  private readonly permissionService = inject(PermissionService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  order: Order | null = null;

  orderId: number | null = null;

  isLoading = false;

  isConfirming = false;

  isCancelling = false;

  isCheckingStock = false;

  errorMessage = '';

  successMessage = '';

  stockLevels: Record<number, number> = {};

  ngOnInit(): void {
    if (!this.hasPermission('ORDER_READ')) {
      this.errorMessage = 'You do not have permission to view orders.';
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/app/orders']);
      return;
    }

    const numericId = Number(id);

    if (Number.isNaN(numericId) || numericId <= 0) {
      this.router.navigate(['/app/orders']);
      return;
    }

    this.orderId = numericId;

    this.loadOrder();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadOrder(): void {
    if (!this.hasPermission('ORDER_READ') || this.orderId === null) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        this.order = response.data;

        this.isLoading = false;

        this.loadStockLevels();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Order details loading failed:', error);

        this.order = null;

        this.errorMessage =
          error?.error?.message || 'Order details could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  private loadStockLevels(): void {
    if (!this.hasPermission('ORDER_READ')) {
      return;
    }

    if (!this.order || this.order.items.length === 0) {
      this.stockLevels = {};

      this.isCheckingStock = false;

      return;
    }

    this.isCheckingStock = true;

    this.stockLevels = {};

    const requests = this.order.items.map((item) =>
      this.inventoryService.getInventory(item.productId),
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        this.stockLevels = {};

        responses.forEach((response, index) => {
          if (!this.order) {
            return;
          }

          const productId = this.order.items[index].productId;

          this.stockLevels[productId] = response.data.quantity;
        });

        this.isCheckingStock = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Stock levels loading failed:', error);

        this.stockLevels = {};

        this.isCheckingStock = false;

        this.cdr.detectChanges();
      },
    });
  }

  getAvailableStock(productId: number): number | null {
    const stock = this.stockLevels[productId];

    if (stock === undefined) {
      return null;
    }

    return stock;
  }

  hasInsufficientStock(): boolean {
    if (!this.order) {
      return false;
    }

    return this.order.items.some((item) => {
      const available = this.stockLevels[item.productId];

      return available !== undefined && item.quantity > available;
    });
  }

  confirmOrder(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.errorMessage = 'You do not have permission to confirm orders.';

      return;
    }

    if (
      this.orderId === null ||
      !this.order ||
      this.order.status !== 'PENDING' ||
      this.isConfirming ||
      this.isCancelling ||
      this.isCheckingStock ||
      this.hasInsufficientStock()
    ) {
      return;
    }

    this.isConfirming = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.orderService.confirmOrder(this.orderId).subscribe({
      next: (response) => {
        this.order = response.data;

        this.isConfirming = false;

        this.successMessage = 'Order confirmed successfully. Inventory has been updated.';

        this.loadStockLevels();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Order confirmation failed:', error);

        this.isConfirming = false;

        this.errorMessage =
          error?.error?.message || 'Order could not be confirmed. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  cancelOrder(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.errorMessage = 'You do not have permission to cancel orders.';

      return;
    }

    if (
      this.orderId === null ||
      !this.order ||
      this.order.status === 'CANCELLED' ||
      this.isConfirming ||
      this.isCancelling
    ) {
      return;
    }

    this.isCancelling = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.orderService.cancelOrder(this.orderId).subscribe({
      next: () => {
        this.isCancelling = false;

        this.successMessage = 'Order cancelled successfully.';

        this.loadOrder();
      },

      error: (error) => {
        console.error('Order cancellation failed:', error);

        this.isCancelling = false;

        this.errorMessage =
          error?.error?.message || 'Order could not be cancelled. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/orders']);
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
