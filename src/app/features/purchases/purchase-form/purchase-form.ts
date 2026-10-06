import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PurchaseService } from '../../../core/services/purchase-service';
import { SupplierService } from '../../../core/services/supplier-service';
import { ProductService } from '../../../core/services/product-service';
import { PermissionService } from '../../../core/services/permission-service';

import { Supplier } from '../../../core/models/Supplier';
import { Product } from '../../../core/models/Product';
import { PurchaseCreateRequest } from '../../../core/models/PurchaseCreateRequest';
import { Purchase } from '../../../core/models/Purchase';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './purchase-form.html',
  styleUrl: './purchase-form.scss',
})
export class PurchaseForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly purchaseService = inject(PurchaseService);

  private readonly supplierService = inject(SupplierService);

  private readonly productService = inject(ProductService);

  private readonly permissionService = inject(PermissionService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly cdr = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];

  products: Product[] = [];

  purchase: Purchase | null = null;

  purchaseId: number | null = null;

  isEditMode = false;

  isLoading = false;

  isLoadingSuppliers = false;

  isLoadingProducts = false;

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  purchaseForm = this.fb.nonNullable.group({
    referenceNumber: ['', [Validators.required, Validators.maxLength(100)]],

    supplierId: [0, [Validators.required, Validators.min(1)]],

    purchaseDate: [this.getToday(), Validators.required],

    notes: ['', Validators.maxLength(500)],

    items: this.fb.array([]),
  });

  // ==========================================
  // PERMISSIONS
  // ==========================================

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  canCreate(): boolean {
    return this.hasPermission('PURCHASE_CREATE');
  }

  canUpdate(): boolean {
    return this.hasPermission('PURCHASE_UPDATE');
  }

  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {
    this.checkEditMode();

    this.loadSuppliers();

    this.loadProducts();

    if (!this.isEditMode) {
      if (!this.canCreate()) {
        this.errorMessage = 'You do not have permission to create purchases.';

        return;
      }

      this.addItem();
    }
  }

  // ==========================================
  // CHECK EDIT MODE
  // ==========================================

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    /*
     * /purchases/new
     */
    if (!id) {
      this.isEditMode = false;

      return;
    }

    /*
     * /purchases/edit/:id
     */
    const numericId = Number(id);

    if (Number.isNaN(numericId) || numericId <= 0) {
      this.router.navigate(['/app/purchases']);

      return;
    }

    this.purchaseId = numericId;

    this.isEditMode = true;

    if (!this.canUpdate()) {
      this.errorMessage = 'You do not have permission to update purchases.';

      return;
    }

    this.loadPurchase(numericId);
  }

  // ==========================================
  // LOAD PURCHASE FOR EDIT
  // ==========================================

  private loadPurchase(id: number): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.purchaseService.getPurchaseById(id).subscribe({
      next: (response) => {
        const purchase = response.data;

        /*
         * Only DRAFT purchases
         * can be edited.
         */
        if (purchase.status !== 'DRAFT') {
          this.errorMessage = 'Only DRAFT purchases can be edited.';

          this.isLoading = false;

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/app/purchases', id]);
          }, 1000);

          return;
        }

        this.purchase = purchase;

        this.populateForm(purchase);

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Purchase loading failed:', error);

        this.purchase = null;

        this.errorMessage =
          error?.error?.message || 'Purchase could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // POPULATE EDIT FORM
  // ==========================================

  private populateForm(purchase: Purchase): void {
    this.purchaseForm.patchValue({
      referenceNumber: purchase.referenceNumber,

      supplierId: purchase.supplierId,

      purchaseDate: purchase.purchaseDate,

      notes: purchase.notes ?? '',
    });

    this.items.clear();

    purchase.items.forEach((purchaseItem) => {
      const itemForm = this.createItemForm();

      itemForm.patchValue({
        productId: purchaseItem.productId,

        quantity: purchaseItem.quantity,

        unitCost: purchaseItem.unitCost,
      });

      this.items.push(itemForm);
    });

    if (this.items.length === 0) {
      this.addItem();
    }
  }

  // ==========================================
  // FORM ARRAY
  // ==========================================

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  private createItemForm() {
    return this.fb.nonNullable.group({
      productId: [0, [Validators.required, Validators.min(1)]],

      quantity: [1, [Validators.required, Validators.min(1)]],

      unitCost: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  addItem(): void {
    /*
     * Create mode requires PURCHASE_CREATE.
     */
    if (!this.isEditMode && !this.canCreate()) {
      return;
    }

    /*
     * Edit mode requires PURCHASE_UPDATE.
     */
    if (this.isEditMode && !this.canUpdate()) {
      return;
    }

    /*
     * Received / Cancelled purchase
     * cannot be modified.
     */
    if (this.isEditMode && this.purchase && this.purchase.status !== 'DRAFT') {
      return;
    }

    this.items.push(this.createItemForm());
  }

  removeItem(index: number): void {
    if (this.items.length === 1) {
      return;
    }

    /*
     * Create mode requires PURCHASE_CREATE.
     */
    if (!this.isEditMode && !this.canCreate()) {
      return;
    }

    /*
     * Edit mode requires PURCHASE_UPDATE.
     */
    if (this.isEditMode && !this.canUpdate()) {
      return;
    }

    /*
     * Don't modify non-DRAFT purchases.
     */
    if (this.isEditMode && this.purchase && this.purchase.status !== 'DRAFT') {
      return;
    }

    this.items.removeAt(index);
  }

  // ==========================================
  // LOAD SUPPLIERS
  // ==========================================

  private loadSuppliers(): void {
    this.isLoadingSuppliers = true;

    this.supplierService.getAllSuppliers(0, 100).subscribe({
      next: (response) => {
        this.suppliers = response.data.content.filter((supplier) => supplier.active);

        this.isLoadingSuppliers = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Suppliers loading failed:', error);

        this.errorMessage = 'Suppliers could not be loaded.';

        this.isLoadingSuppliers = false;

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  private loadProducts(): void {
    this.isLoadingProducts = true;

    this.productService.getAllProducts(0, 100).subscribe({
      next: (response) => {
        this.products = response.data.content.filter((product) => product.active);

        this.isLoadingProducts = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Products loading failed:', error);

        this.errorMessage = 'Products could not be loaded.';

        this.isLoadingProducts = false;

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // PRODUCT CHANGE
  // ==========================================

  onProductChange(index: number): void {
    if ((!this.isEditMode && !this.canCreate()) || (this.isEditMode && !this.canUpdate())) {
      return;
    }

    const item = this.items.at(index);

    const productId = Number(item.get('productId')?.value);

    const product = this.products.find((product) => product.id === productId);

    if (!product) {
      return;
    }

    /*
     * CREATE MODE:
     * Automatically use product's
     * current cost price.
     *
     * EDIT MODE:
     * Keep existing unit cost.
     */
    if (!this.isEditMode) {
      item.patchValue({
        unitCost: product.costPrice,
      });
    }
  }

  // ==========================================
  // SUBTOTAL
  // ==========================================

  getItemSubtotal(index: number): number {
    const item = this.items.at(index);

    const quantity = Number(item.get('quantity')?.value || 0);

    const unitCost = Number(item.get('unitCost')?.value || 0);

    return quantity * unitCost;
  }

  // ==========================================
  // GRAND TOTAL
  // ==========================================

  get grandTotal(): number {
    return this.items.controls.reduce((total, _, index) => total + this.getItemSubtotal(index), 0);
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  submit(): void {
    /*
     * CREATE permission
     */
    if (!this.isEditMode && !this.canCreate()) {
      this.errorMessage = 'You do not have permission to create purchases.';

      return;
    }

    /*
     * UPDATE permission
     */
    if (this.isEditMode && !this.canUpdate()) {
      this.errorMessage = 'You do not have permission to update purchases.';

      return;
    }

    /*
     * Only DRAFT purchases
     * can be updated.
     */
    if (this.isEditMode && this.purchase && this.purchase.status !== 'DRAFT') {
      this.errorMessage = 'Only DRAFT purchases can be updated.';

      return;
    }

    /*
     * Validate form.
     */
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();

      this.errorMessage = 'Please complete all required fields.';

      return;
    }

    /*
     * At least one item.
     */
    if (this.items.length === 0) {
      this.errorMessage = 'At least one purchase item is required.';

      return;
    }

    this.isSaving = true;

    this.errorMessage = '';

    this.successMessage = '';

    const formValue = this.purchaseForm.getRawValue();

    const request: PurchaseCreateRequest = {
      referenceNumber: formValue.referenceNumber.trim(),

      supplierId: Number(formValue.supplierId),

      purchaseDate: formValue.purchaseDate,

      notes: formValue.notes.trim(),

      items: this.items.controls.map((control) => ({
        productId: Number(control.get('productId')?.value),

        quantity: Number(control.get('quantity')?.value),

        unitCost: Number(control.get('unitCost')?.value),
      })),
    };

    // ========================================
    // UPDATE
    // ========================================

    if (this.isEditMode && this.purchaseId !== null) {
      this.purchaseService.updatePurchase(this.purchaseId, request).subscribe({
        next: () => {
          this.isSaving = false;

          this.successMessage = 'Purchase updated successfully.';

          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/app/purchases', this.purchaseId]);
          }, 500);
        },

        error: (error) => {
          console.error('Purchase update failed:', error);

          this.isSaving = false;

          this.errorMessage =
            error?.error?.message || 'Purchase could not be updated. Please try again.';

          this.cdr.detectChanges();
        },
      });

      return;
    }

    // ========================================
    // CREATE
    // ========================================

    this.purchaseService.createPurchase(request).subscribe({
      next: (response) => {
        this.isSaving = false;

        this.successMessage = 'Purchase created successfully.';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/app/purchases', response.data.id]);
        }, 500);
      },

      error: (error) => {
        console.error('Purchase creation failed:', error);

        this.isSaving = false;

        this.errorMessage =
          error?.error?.message || 'Purchase could not be created. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // ==========================================
  // CANCEL / BACK
  // ==========================================

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    if (this.isEditMode && this.purchaseId !== null) {
      this.router.navigate(['/app/purchases', this.purchaseId]);

      return;
    }

    this.router.navigate(['/app/purchases']);
  }

  // ==========================================
  // TODAY
  // ==========================================

  private getToday(): string {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, '0');

    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
