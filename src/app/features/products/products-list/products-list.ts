import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../../core/services/product-service';
import { Product } from '../../../core/models/Product';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList implements OnInit {

  private readonly productService =
    inject(ProductService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly notificationService =
    inject(NotificationService);

  private readonly permissionService =
    inject(PermissionService);

  products: Product[] = [];

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  errorMessage = '';

  searchTerm = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(
      permission
    );
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';


this.productService
  .getAllProducts(
    this.currentPage,
    this.pageSize
  )
  .subscribe({
    next: (response: any) => {
      console.log(
        'Products Raw Response:',
        response
      );

      const pageData =
        response?.data?.content
          ? response.data
          : response?.content
            ? response
            : null;

      if (
        pageData &&
        Array.isArray(pageData.content)
      ) {
        this.products =
          pageData.content;

        this.totalPages =
          pageData.totalPages ?? 0;

        this.totalElements =
          pageData.totalElements ?? 0;

        this.currentPage =
          pageData.number ?? 0;
      } else {
        console.warn(
          'Unexpected response structure:',
          response
        );

        this.products = [];
        this.totalPages = 0;
        this.totalElements = 0;
      }

      this.isLoading = false;

      this.cdr.detectChanges();
    },

    error: (error) => {
      console.error(
        'Products loading failed:',
        error
      );

      this.errorMessage =
        'Products could not be loaded. Please try again.';

      this.isLoading = false;

      this.cdr.detectChanges();
    },
  });


  }

  goToPage(page: number): void {
    if (
      page < 0 ||
      page >= this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

this.currentPage = page;
this.loadProducts();


  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index
    );
  }

  deactivateProduct(
    product: Product
  ): void {


if (
  !this.hasPermission(
    'PRODUCT_UPDATE'
  )
) {
  return;
}

const confirmed = window.confirm(
  `Are you sure you want to deactivate "${product.name}"?`
);

if (!confirmed) {
  return;
}

this.productService
  .deactivateProduct(product.id)
  .subscribe({
    next: () => {
      this.notificationService.success(
        'Product deactivated successfully.'
      );

      this.loadProducts();
    },

    error: (error) => {
      console.error(
        'Product deactivation failed:',
        error
      );

      this.notificationService.error(
        error?.error?.message ||
          'Product could not be deactivated. Please try again.'
      );
    },
  });


  }

  get filteredProducts(): Product[] {
    const term =
      this.searchTerm
        .trim()
        .toLowerCase();


if (!term) {
  return this.products;
}

return this.products.filter(
  (product) =>
    product.name
      .toLowerCase()
      .includes(term) ||
    product.sku
      .toLowerCase()
      .includes(term)
);


  }
}
