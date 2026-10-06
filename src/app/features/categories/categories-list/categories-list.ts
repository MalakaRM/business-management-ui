import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { CategoryService } from '../../../core/services/category-service';
import { Category } from '../../../core/models/Category';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.scss',
})
export class CategoriesList implements OnInit {
  private readonly categoryService = inject(CategoryService);

  private readonly notificationService = inject(NotificationService);

  private readonly permissionService = inject(PermissionService);

  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];

  isLoading = false;

  errorMessage = '';

  searchTerm = '';

  currentPage = 0;

  pageSize = 10;

  totalPages = 0;

  totalElements = 0;

  ngOnInit(): void {
    if (!this.hasPermission('CATEGORY_READ')) {
      return;
    }

    this.loadCategories();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadCategories(): void {
    if (!this.hasPermission('CATEGORY_READ')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    this.categoryService.getAllCategories(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const pageData = response.data;

        this.categories = pageData.content;

        this.totalPages = pageData.totalPages;

        this.totalElements = pageData.totalElements;

        this.currentPage = pageData.number;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Categories loading failed:', error);

        this.categories = [];

        this.totalPages = 0;

        this.totalElements = 0;

        this.errorMessage =
          error?.error?.message || 'Categories could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  goToPage(page: number): void {
    if (!this.hasPermission('CATEGORY_READ')) {
      return;
    }

    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;

    this.loadCategories();
  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index,
    );
  }

  get filteredCategories(): Category[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.categories;
    }

    return this.categories.filter((category) => category.name.toLowerCase().includes(term));
  }

  deactivateCategory(category: Category): void {
    if (!this.hasPermission('CATEGORY_UPDATE')) {
      return;
    }

    if (!category.active) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to deactivate "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    this.categoryService.deactivateCategory(category.id).subscribe({
      next: (response) => {
        const updatedCategory = response.data;

        this.categories = this.categories.map((item) =>
          item.id === updatedCategory.id ? updatedCategory : item,
        );

        this.notificationService.success('Category deactivated successfully.');

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Category deactivation failed:', error);

        this.notificationService.error(
          error?.error?.message || 'Category could not be deactivated. Please try again.',
        );

        this.cdr.detectChanges();
      },
    });
  }
}
