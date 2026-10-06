import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { InventoryService } from '../../../core/services/inventory-service';
import { ProductService } from '../../../core/services/product-service';
import { CustomerService } from '../../../core/services/customer-service';
import { OrderService } from '../../../core/services/order-service';
import { PermissionService } from '../../../core/services/permission-service';

import { Product } from '../../../core/models/Product';
import { PosCartItem } from '../../../core/models/PosCartItem';
import { Customer } from '../../../core/models/Customer';
import { OrderCreateRequest } from '../../../core/models/OrderCreateRequest';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.html',
  styleUrl: './pos.scss',
})
export class Pos implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly inventoryService = inject(InventoryService);
  private readonly customerService = inject(CustomerService);
  private readonly orderService = inject(OrderService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  cartItems: PosCartItem[] = [];

  customers: Customer[] = [];
  selectedCustomerId: number | null = null;
  isLoadingCustomers = false;

  cashierName = localStorage.getItem('username') || 'Cashier';

  products: Product[] = [];
  filteredProducts: Product[] = [];
  stockLevels: Record<number, number> = {};

  searchTerm = '';

  isLoadingProducts = false;
  isLoadingStock = false;
  isCreatingOrder = false;
  isCompletingSale = false;

  createdOrderId: number | null = null;
  createdOrderNumber: string | null = null;

  orderError = '';
  paymentError = '';
  saleSuccessMessage = '';

  ngOnInit(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.orderError = 'You do not have permission to access POS.';
      return;
    }

    this.loadCustomers();
    this.loadProducts();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadCustomers(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      return;
    }

    this.isLoadingCustomers = true;

    this.customerService.getAllCustomers(0, 100).subscribe({
      next: (response) => {
        this.customers = response.data.content.filter((customer) => customer.active);

        this.isLoadingCustomers = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('POS customers loading failed:', error);

        this.customers = [];

        this.isLoadingCustomers = false;

        this.cdr.detectChanges();
      },
    });
  }

  onCustomerChange(): void {
    this.orderError = '';

    this.cdr.detectChanges();
  }

  private loadProducts(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      return;
    }

    this.isLoadingProducts = true;

    this.productService.getAllProducts(0, 100).subscribe({
      next: (response) => {
        this.products = response.data.content.filter((product) => product.active);

        this.filteredProducts = this.products;

        this.isLoadingProducts = false;

        this.loadStockLevels();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('POS products loading failed:', error);

        this.products = [];
        this.filteredProducts = [];
        this.isLoadingProducts = false;

        this.cdr.detectChanges();
      },
    });
  }

  private loadStockLevels(): void {
    if (this.products.length === 0) {
      this.stockLevels = {};
      this.isLoadingStock = false;

      return;
    }

    this.isLoadingStock = true;
    this.stockLevels = {};

    let completedRequests = 0;

    this.products.forEach((product) => {
      this.inventoryService.getInventory(product.id).subscribe({
        next: (response) => {
          this.stockLevels[product.id] = response.data.quantity;

          completedRequests++;

          this.finishStockLoading(completedRequests);

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(`Stock loading failed for product ${product.id}:`, error);

          this.stockLevels[product.id] = 0;

          completedRequests++;

          this.finishStockLoading(completedRequests);

          this.cdr.detectChanges();
        },
      });
    });
  }

  private finishStockLoading(completedRequests: number): void {
    if (completedRequests >= this.products.length) {
      this.isLoadingStock = false;

      this.cdr.detectChanges();
    }
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredProducts = this.products;

      return;
    }

    this.filteredProducts = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term),
    );
  }

  clearSearch(): void {
    this.searchTerm = '';

    this.filteredProducts = this.products;
  }

  getStock(productId: number): number {
    return this.stockLevels[productId] ?? 0;
  }

  canAddProduct(productId: number): boolean {
    return this.getStock(productId) > 0;
  }

  addToCart(product: Product): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.orderError = 'You do not have permission to create sales.';
      return;
    }

    if (!this.canAddProduct(product.id)) {
      return;
    }

    const existingItem = this.cartItems.find((item) => item.product.id === product.id);

    if (existingItem) {
      const availableStock = this.getStock(product.id);

      if (existingItem.quantity < availableStock) {
        existingItem.quantity++;
      }

      this.saleSuccessMessage = '';

      return;
    }

    this.cartItems.push({
      product,
      quantity: 1,
    });

    this.saleSuccessMessage = '';
    this.orderError = '';

    this.cdr.detectChanges();
  }

  increaseQuantity(item: PosCartItem): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      return;
    }

    const availableStock = this.getStock(item.product.id);

    if (item.quantity < availableStock) {
      item.quantity++;

      this.orderError = '';

      this.cdr.detectChanges();
    }
  }

  decreaseQuantity(item: PosCartItem): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      return;
    }

    if (item.quantity > 1) {
      item.quantity--;

      this.orderError = '';

      this.cdr.detectChanges();
    }
  }

  removeFromCart(productId: number): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      return;
    }

    this.cartItems = this.cartItems.filter((item) => item.product.id !== productId);

    this.orderError = '';

    this.cdr.detectChanges();
  }

  clearCart(): void {
    this.cartItems = [];
    this.selectedCustomerId = null;
    this.createdOrderId = null;
    this.createdOrderNumber = null;

    this.isCreatingOrder = false;
    this.isCompletingSale = false;

    this.orderError = '';
    this.paymentError = '';
    this.saleSuccessMessage = '';

    this.cdr.detectChanges();
  }

  get cartItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getItemSubtotal(item: PosCartItem): number {
    return item.product.price * item.quantity;
  }

  get cartSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + this.getItemSubtotal(item), 0);
  }

  get discount(): number {
    return 0;
  }

  get cartTotal(): number {
    return this.cartSubtotal - this.discount;
  }

  proceedToPayment(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.orderError = 'You do not have permission to create sales.';
      return;
    }

    if (this.cartItems.length === 0) {
      this.orderError = 'Please add at least one product to the sale.';

      return;
    }

    if (this.isCreatingOrder || this.isCompletingSale) {
      return;
    }

    this.orderError = '';
    this.paymentError = '';
    this.saleSuccessMessage = '';

    this.isCreatingOrder = true;

    const request: OrderCreateRequest = {
      orderNumber: '',

      customerId: this.selectedCustomerId,

      orderDate: this.getTodayDate(),

      items: this.cartItems.map((item) => ({
        productId: item.product.id,

        quantity: item.quantity,
      })),
    };

    this.orderService.createOrder(request).subscribe({
      next: (response) => {
        this.isCreatingOrder = false;

        if (!response.success || !response.data?.id) {
          this.orderError = response.message || 'Failed to create order.';

          this.cdr.detectChanges();

          return;
        }

        this.createdOrderId = response.data.id;

        this.createdOrderNumber = response.data.orderNumber;

        this.router.navigate(['/app/pos/payment'], {
          queryParams: {
            orderId: response.data.id,
          },
        });
      },

      error: (error) => {
        console.error('POS order creation failed:', error);

        this.isCreatingOrder = false;

        this.orderError = error?.error?.message || 'Failed to create order. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  private getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, '0');

    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  openFullScreenPos(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.orderError = 'You do not have permission to access POS.';
      return;
    }

    this.router.navigate(['/pos/fullscreen']);
  }

  openNewPosWindow(): void {
    if (!this.hasPermission('ORDER_CREATE')) {
      this.orderError = 'You do not have permission to access POS.';
      return;
    }

    const newWindow = window.open(
      '/pos/fullscreen',
      '_blank',
      [
        'width=1400',
        'height=900',
        'resizable=yes',
        'scrollbars=yes',
        'menubar=no',
        'toolbar=no',
        'location=no',
        'status=no',
      ].join(','),
    );

    if (!newWindow) {
      this.orderError = 'Unable to open a new POS window. Please allow pop-ups for this site.';

      this.cdr.detectChanges();

      return;
    }

    newWindow.focus();
  }
}
