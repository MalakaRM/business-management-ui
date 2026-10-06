import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CategoryService } from '../../../core/services/category-service';
import { Category } from '../../../core/models/Category';
import { ProductService } from '../../../core/services/product-service';
import { ProductCreateRequest } from '../../../core/models/ProductCreateRequest';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly permissionService = inject(PermissionService);

  categories: Category[] = [];

  isLoadingCategories = false;
  categoryError = '';

  isSubmitting = false;
  submitError = '';

  isEditMode = false;
  productId: number | null = null;
  isLoadingProduct = false;

  productForm = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(150),
      ],
    ],


sku: [
  '',
  [
    Validators.required,
    Validators.maxLength(100),
  ],
],

price: [
  0,
  [
    Validators.required,
    Validators.min(0.01),
  ],
],

costPrice: [
  0,
  [
    Validators.required,
    Validators.min(0.01),
  ],
],

description: [
  '',
  [
    Validators.maxLength(500),
  ],
],

categoryId: [
  0,
  [
    Validators.required,
    Validators.min(1),
  ],
],


});

ngOnInit(): void {
  this.loadCategories();


const id = this.route.snapshot.paramMap.get('id');

if (id) {
  this.isEditMode = true;
  this.productId = Number(id);
  this.loadProduct(this.productId);
}


}

hasPermission(permission: string): boolean {
  return this.permissionService.hasPermission(permission);
}

canSubmit(): boolean {
  if (this.isSubmitting) {
    return false;
  }

if (this.isEditMode) {
  return this.hasPermission('PRODUCT_UPDATE');
}

return this.hasPermission('PRODUCT_CREATE');


}

onSubmit(): void {
  if (!this.canSubmit()) {
  return;
}

if (this.productForm.invalid) {
  this.productForm.markAllAsTouched();
  return;
}

this.isSubmitting = true;
this.submitError = '';

const request: ProductCreateRequest =
  this.productForm.getRawValue();

if (
  this.isEditMode &&
  this.productId !== null
) {
  this.productService
    .updateProduct(
      this.productId,
      request
    )
    .subscribe({
      next: (response) => {
        console.log(
          'Product updated:',
          response
        );

        this.isSubmitting = false;

        this.notificationService.success(
          'Product updated successfully.'
        );

        this.router.navigate([
          '/app/products',
        ]);
      },

      error: (error) => {
        console.error(
          'Product update failed:',
          error
        );

        this.submitError =
          error?.error?.message ||
          'Product could not be updated. Please try again.';

        this.isSubmitting = false;
      },
    });

  return;
}

this.productService
  .createProduct(request)
  .subscribe({
    next: (response) => {
      console.log(
        'Product created:',
        response
      );

      this.isSubmitting = false;

      this.notificationService.success(
        'Product created successfully.'
      );

      this.router.navigate([
        '/app/products',
      ]);
    },

    error: (error) => {
      console.error(
        'Product creation failed:',
        error
      );

      this.submitError =
        error?.error?.message ||
        'Product could not be created. Please try again.';

      this.isSubmitting = false;
    },
  });


}

cancel(): void {
  this.router.navigate([
    '/app/products',
  ]);
}

private loadCategories(): void {
  this.isLoadingCategories = true;
  this.categoryError = '';

this.categoryService
  .getAllCategories(0, 100)
  .subscribe({
    next: (response) => {
      this.categories =
        response.data.content.filter(
          (category) => category.active
        );

      this.isLoadingCategories = false;
    },

    error: (error) => {
      console.error(
        'Categories loading failed:',
        error
      );

      this.categoryError =
        'Categories could not be loaded. Please try again.';

      this.isLoadingCategories = false;
    },
  });


}

private loadProduct(id: number): void {
  this.isLoadingProduct = true;
  this.submitError = '';


this.productService
  .getProductById(id)
  .subscribe({
    next: (response) => {
      const product = response.data;

      this.productForm.patchValue({
        name: product.name,
        sku: product.sku,
        price: product.price,
        costPrice: product.costPrice,
        description: product.description,
        categoryId: product.categoryId,
      });

      this.isLoadingProduct = false;
    },

    error: (error) => {
      console.error(
        'Product loading failed:',
        error
      );

      this.submitError =
        error?.error?.message ||
        'Product could not be loaded. Please try again.';

      this.isLoadingProduct = false;
    },
  });


}

get selectedCategoryName(): string {
  const categoryId =
    this.productForm.controls.categoryId.value;

const category =
  this.categories.find(
    (category) =>
      category.id === categoryId
  );

return category?.name ?? '';


}
}
