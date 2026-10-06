
import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import {
  catchError,
  forkJoin,
  map,
  of,
} from 'rxjs';

import { OrderService } from '../../../core/services/order-service';
import { CustomerService } from '../../../core/services/customer-service';
import { ProductService } from '../../../core/services/product-service';
import { InventoryService } from '../../../core/services/inventory-service';
import { PermissionService } from '../../../core/services/permission-service';

import { Customer } from '../../../core/models/Customer';
import { Product } from '../../../core/models/Product';
import { Order } from '../../../core/models/Order';
import { OrderCreateRequest } from '../../../core/models/OrderCreateRequest';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './order-form.html',
  styleUrl: './order-form.scss',
})
export class OrderForm implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly orderService =
    inject(OrderService);

  private readonly customerService =
    inject(CustomerService);

  private readonly productService =
    inject(ProductService);

  private readonly inventoryService =
    inject(InventoryService);

  private readonly permissionService =
    inject(PermissionService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  private readonly cdr =
    inject(ChangeDetectorRef);

  protected readonly Number = Number;

  customers: Customer[] = [];
  products: Product[] = [];

  order: Order | null = null;
  orderId: number | null = null;

  isEditMode = false;

  isLoading = false;
  isLoadingCustomers = false;
  isLoadingProducts = false;
  isLoadingStock = false;
  isCheckingStock = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  stockLevels: Record<number, number> = {};

  orderForm =
    this.fb.nonNullable.group({
      orderNumber: [
        '',
        [Validators.maxLength(100)],
      ],

      customerId: [
        null as number | null,
      ],

      orderDate: [
        this.getToday(),
        Validators.required,
      ],

      items: this.fb.array([]),
    });

  ngOnInit(): void {

    this.checkEditMode();

    this.loadCustomers();

    this.loadProducts();

    if (!this.isEditMode) {

      if (!this.canCreate()) {
        this.errorMessage =
          'You do not have permission to create orders.';
        return;
      }

      this.addItem();
    }
  }

  // =========================================================
  // PERMISSIONS
  // =========================================================

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  canCreate(): boolean {
    return this.hasPermission('ORDER_CREATE');
  }

  canUpdate(): boolean {
    /*
     * Backend currently uses ORDER_CREATE
     * for order updates.
     */
    return this.hasPermission('ORDER_CREATE');
  }

  canManageOrder(): boolean {
    return this.hasPermission('ORDER_CREATE');
  }

  // =========================================================
  // EDIT MODE
  // =========================================================

  private checkEditMode(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.isEditMode = false;
      return;
    }

    const numericId = Number(id);

    if (
      Number.isNaN(numericId) ||
      numericId <= 0
    ) {

      this.router.navigate([
        '/app/orders',
      ]);

      return;
    }

    this.orderId = numericId;
    this.isEditMode = true;

    if (!this.canUpdate()) {

      this.errorMessage =
        'You do not have permission to update orders.';

      return;
    }

    this.loadOrder(numericId);
  }

  private loadOrder(id: number): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.orderService
      .getOrderById(id)
      .subscribe({

        next: (response) => {

          const order =
            response.data;

          if (order.status !== 'PENDING') {

            this.errorMessage =
              'Only PENDING orders can be edited.';

            this.isLoading = false;

            this.cdr.detectChanges();

            setTimeout(() => {

              this.router.navigate([
                '/app/orders',
                id,
              ]);

            }, 1000);

            return;
          }

          this.order = order;

          this.populateForm(order);

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Order loading failed:',
            error,
          );

          this.order = null;

          this.errorMessage =
            error?.error?.message ||
            'Order could not be loaded. Please try again.';

          this.isLoading = false;

          this.cdr.detectChanges();
        },
      });
  }

  private populateForm(
    order: Order,
  ): void {

    this.orderForm.patchValue({
      orderNumber:
        order.orderNumber,

      customerId:
        order.customerId,

      orderDate:
        order.orderDate,
    });

    this.items.clear();

    order.items.forEach(
      (orderItem) => {

        const itemForm =
          this.createItemForm();

        itemForm.patchValue({
          productId:
            orderItem.productId,

          quantity:
            orderItem.quantity,
        });

        this.items.push(itemForm);
      },
    );

    if (this.items.length === 0) {
      this.addItem();
    }
  }

  // =========================================================
  // FORM ITEMS
  // =========================================================

  get items(): FormArray {
    return this.orderForm.get(
      'items',
    ) as FormArray;
  }

  private createItemForm() {

    const itemForm =
      this.fb.nonNullable.group({

        productId: [
          0,
          [
            Validators.required,
            Validators.min(1),
          ],
        ],

        quantity: [
          1,
          [
            Validators.required,
            Validators.min(1),
          ],
        ],
      });

    itemForm
      .get('productId')
      ?.valueChanges
      .subscribe((productId) => {

        if (
          !this.isEditMode &&
          productId > 0
        ) {

          this.loadStockForProduct(
            productId,
          );
        }
      });

    return itemForm;
  }

  addItem(): void {

    if (!this.canManageOrder()) {
      return;
    }

    if (
      this.isEditMode &&
      this.order &&
      this.order.status !== 'PENDING'
    ) {
      return;
    }

    this.items.push(
      this.createItemForm(),
    );
  }

  removeItem(index: number): void {

    if (!this.canManageOrder()) {
      return;
    }

    if (this.items.length === 1) {
      return;
    }

    if (
      this.isEditMode &&
      this.order &&
      this.order.status !== 'PENDING'
    ) {
      return;
    }

    this.items.removeAt(index);
  }

  // =========================================================
  // CUSTOMERS
  // =========================================================

  private loadCustomers(): void {

    this.isLoadingCustomers = true;

    this.customerService
      .getAllCustomers(0, 100)
      .subscribe({

        next: (response) => {

          this.customers =
            response.data.content.filter(
              (customer) =>
                customer.active,
            );

          this.isLoadingCustomers =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Customers loading failed:',
            error,
          );

          this.errorMessage =
            'Customers could not be loaded.';

          this.isLoadingCustomers =
            false;

          this.cdr.detectChanges();
        },
      });
  }

  // =========================================================
  // PRODUCTS + INVENTORY
  // =========================================================

  private loadProducts(): void {

    this.isLoadingProducts = true;

    this.productService
      .getAllProducts(0, 100)
      .subscribe({

        next: (response) => {

          const activeProducts =
            response.data.content.filter(
              (product) =>
                product.active,
            );

          if (this.isEditMode) {

            this.products =
              activeProducts;

            this.isLoadingProducts =
              false;

            this.cdr.detectChanges();

            return;
          }

          if (
            activeProducts.length === 0
          ) {

            this.products = [];

            this.isLoadingStock =
              false;

            this.isLoadingProducts =
              false;

            this.cdr.detectChanges();

            return;
          }

          this.isLoadingStock = true;

          const requests =
            activeProducts.map(
              (product) =>

                this.inventoryService
                  .getInventory(product.id)
                  .pipe(

                    map((response) => ({
                      product,
                      quantity:
                        response.data.quantity,
                    })),

                    catchError((error) => {

                      console.warn(
                        `Inventory unavailable for product ${product.id}`,
                        error,
                      );

                      return of(null);
                    }),
                  ),
            );

          forkJoin(requests)
            .subscribe({

              next: (results) => {

                this.products =
                  results
                    .filter(
                      (
                        result,
                      ): result is {
                        product: Product;
                        quantity: number;
                      } =>
                        result !== null &&
                        result.quantity > 0,
                    )
                    .map(
                      (result) => {

                        this.stockLevels[
                          result.product.id
                        ] =
                          result.quantity;

                        return result.product;
                      },
                    );

                this.isLoadingStock =
                  false;

                this.isLoadingProducts =
                  false;

                this.cdr.detectChanges();
              },

              error: (error) => {

                console.error(
                  'Stock levels loading failed:',
                  error,
                );

                this.products = [];

                this.stockLevels = {};

                this.isLoadingStock =
                  false;

                this.isLoadingProducts =
                  false;

                this.errorMessage =
                  'Product stock levels could not be loaded. Please try again.';

                this.cdr.detectChanges();
              },
            });
        },

        error: (error) => {

          console.error(
            'Products loading failed:',
            error,
          );

          this.products = [];

          this.isLoadingProducts =
            false;

          this.isLoadingStock =
            false;

          this.errorMessage =
            'Products could not be loaded.';

          this.cdr.detectChanges();
        },
      });
  }

  // =========================================================
  // SELECTED PRODUCT STOCK
  // =========================================================

  private loadStockForProduct(
    productId: number,
  ): void {

    if (this.isEditMode) {
      return;
    }

    this.isCheckingStock = true;

    this.inventoryService
      .getInventory(productId)
      .subscribe({

        next: (response) => {

          this.stockLevels[productId] =
            response.data.quantity;

          this.isCheckingStock =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Stock loading failed:',
            error,
          );

          delete this.stockLevels[
            productId
          ];

          this.isCheckingStock =
            false;

          this.cdr.detectChanges();
        },
      });
  }

  // =========================================================
  // PRODUCT HELPERS
  // =========================================================

  getProduct(
    productId: number,
  ): Product | undefined {

    return this.products.find(
      (product) =>
        product.id === productId,
    );
  }

  getAvailableStock(
    productId: number,
  ): number | null {

    if (this.isEditMode) {
      return null;
    }

    return (
      this.stockLevels[productId]
      ?? null
    );
  }

  // =========================================================
  // STOCK VALIDATION
  // =========================================================

  isStockInsufficient(
    index: number,
  ): boolean {

    if (this.isEditMode) {
      return false;
    }

    const item =
      this.items.at(index);

    const productId =
      Number(
        item.get(
          'productId',
        )?.value,
      );

    const quantity =
      Number(
        item.get(
          'quantity',
        )?.value || 0,
      );

    const available =
      this.stockLevels[productId];

    if (
      available === undefined
    ) {
      return false;
    }

    return quantity > available;
  }

  hasInsufficientStock(): boolean {

    if (
      this.isEditMode ||
      this.items.length === 0
    ) {
      return false;
    }

    return this.items.controls.some(
      (_, index) =>
        this.isStockInsufficient(
          index,
        ),
    );
  }

  // =========================================================
  // PRICE CALCULATIONS
  // =========================================================

  getItemSubtotal(
    index: number,
  ): number {

    const item =
      this.items.at(index);

    const productId =
      Number(
        item.get(
          'productId',
        )?.value,
      );

    const quantity =
      Number(
        item.get(
          'quantity',
        )?.value || 0,
      );

    const product =
      this.getProduct(productId);

    if (!product) {
      return 0;
    }

    return (
      quantity *
      product.price
    );
  }

  get grandTotal(): number {

    return this.items.controls.reduce(
      (total, _, index) =>
        total +
        this.getItemSubtotal(index),
      0,
    );
  }

  getItemUnitPrice(
    index: number,
  ): number {

    const item =
      this.items.at(index);

    const productId =
      Number(
        item.get(
          'productId',
        )?.value,
      );

    const product =
      this.getProduct(productId);

    return product?.price ?? 0;
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  submit(): void {

    if (!this.canManageOrder()) {

      this.errorMessage =
        this.isEditMode
          ? 'You do not have permission to update orders.'
          : 'You do not have permission to create orders.';

      return;
    }

    if (
      this.isEditMode &&
      this.order &&
      this.order.status !== 'PENDING'
    ) {

      this.errorMessage =
        'Only PENDING orders can be updated.';

      return;
    }

    if (
      this.orderForm.invalid
    ) {

      this.orderForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required fields.';

      return;
    }

    if (
      this.items.length === 0
    ) {

      this.errorMessage =
        'At least one order item is required.';

      return;
    }

    const hasInvalidProduct =
      this.items.controls.some(
        (control) => {

          const productId =
            Number(
              control.get(
                'productId',
              )?.value,
            );

          return (
            productId <= 0 ||
            !this.getProduct(
              productId,
            )
          );
        },
      );

    if (hasInvalidProduct) {

      this.errorMessage =
        'Please select a valid product for every item.';

      return;
    }

    if (
      !this.isEditMode &&
      this.hasInsufficientStock()
    ) {

      this.errorMessage =
        'One or more products do not have enough stock. Please reduce the quantity or update inventory.';

      return;
    }

    this.isSaving = true;

    this.errorMessage = '';
    this.successMessage = '';

    const formValue =
      this.orderForm.getRawValue();

    const request:
      OrderCreateRequest = {

      orderNumber:
        formValue.orderNumber.trim(),

      customerId:
        formValue.customerId
          ? Number(
              formValue.customerId,
            )
          : null,

      orderDate:
        formValue.orderDate,

      items:
        this.items.controls.map(
          (control) => ({

            productId:
              Number(
                control.get(
                  'productId',
                )?.value,
              ),

            quantity:
              Number(
                control.get(
                  'quantity',
                )?.value,
              ),
          }),
        ),
    };

    // =======================================================
    // UPDATE
    // =======================================================

    if (
      this.isEditMode &&
      this.orderId !== null
    ) {

      this.orderService
        .updateOrder(
          this.orderId,
          request,
        )
        .subscribe({

          next: () => {

            this.isSaving = false;

            this.successMessage =
              'Order updated successfully.';

            this.cdr.detectChanges();

            setTimeout(() => {

              this.router.navigate([
                '/app/orders',
                this.orderId,
              ]);

            }, 500);
          },

          error: (error) => {

            console.error(
              'Order update failed:',
              error,
            );

            this.isSaving = false;

            this.errorMessage =
              error?.error?.message ||
              'Order could not be updated. Please try again.';

            this.cdr.detectChanges();
          },
        });

      return;
    }

    // =======================================================
    // CREATE
    // =======================================================

    this.orderService
      .createOrder(request)
      .subscribe({

        next: (response) => {

          this.isSaving = false;

          this.successMessage =
            'Order created successfully.';

          this.cdr.detectChanges();

          this.router.navigate([
            '/app/orders',
            response.data.id,
          ]);
        },

        error: (error) => {

          console.error(
            'Order creation failed:',
            error,
          );

          this.isSaving = false;

          this.errorMessage =
            error?.error?.message ||
            'Order could not be created. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    if (this.isSaving) {
      return;
    }

    if (
      this.isEditMode &&
      this.orderId !== null
    ) {

      this.router.navigate([
        '/app/orders',
        this.orderId,
      ]);

      return;
    }

    this.router.navigate([
      '/app/orders',
    ]);
  }

  // =========================================================
  // DATE
  // =========================================================

  private getToday(): string {

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        today.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}

