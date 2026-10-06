import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { CategoryService } from '../../../core/services/category-service';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-categories-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories-form.html',
  styleUrl: './categories-form.scss',
})
export class CategoriesForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly categoryService = inject(CategoryService);

  private readonly notificationService = inject(NotificationService);

  private readonly permissionService = inject(PermissionService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly cdr = inject(ChangeDetectorRef);

  isSubmitting = false;

  isLoadingCategory = false;

  submitError = '';

  isEditMode = false;

  categoryId: number | null = null;

  categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],

    description: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    /*
     * Edit Mode
     */
    if (id) {
      this.isEditMode = true;

      const numericId = Number(id);

      if (Number.isNaN(numericId) || numericId <= 0) {
        this.submitError = 'Invalid category ID.';

        return;
      }

      this.categoryId = numericId;

      /*
       * CATEGORY_READ is required
       * to load and view category data.
       */
      if (!this.hasPermission('CATEGORY_READ')) {
        this.submitError = 'You do not have permission to view this category.';

        return;
      }

      this.loadCategory(numericId);

      return;
    }

    /*
     * Create Mode
     */
    if (!this.hasPermission('CATEGORY_CREATE')) {
      this.submitError = 'You do not have permission to create categories.';
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  onSubmit(): void {
    /*
     * Permission required for the action.
     */
    const requiredPermission = this.isEditMode ? 'CATEGORY_UPDATE' : 'CATEGORY_CREATE';

    /*
     * Permission check.
     */
    if (!this.hasPermission(requiredPermission)) {
      this.submitError = this.isEditMode
        ? 'You do not have permission to update categories.'
        : 'You do not have permission to create categories.';

      this.cdr.detectChanges();

      return;
    }

    /*
     * Form validation.
     */
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();

      return;
    }

    /*
     * Edit mode must have a valid ID.
     */
    if (this.isEditMode && this.categoryId === null) {
      this.submitError = 'Invalid category information.';

      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const request = this.categoryForm.getRawValue();

    /*
     * Update Category
     */
    if (this.isEditMode && this.categoryId !== null) {
      this.categoryService.updateCategory(this.categoryId, request).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.notificationService.success('Category updated successfully.');

          this.router.navigate(['/app/categories']);
        },

        error: (error) => {
          console.error('Category update failed:', error);

          this.submitError =
            error?.error?.message || 'Category could not be updated. Please try again.';

          this.isSubmitting = false;

          this.cdr.detectChanges();
        },
      });

      return;
    }

    /*
     * Create Category
     */
    this.categoryService.createCategory(request).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.notificationService.success('Category created successfully.');

        this.router.navigate(['/app/categories']);
      },

      error: (error) => {
        console.error('Category creation failed:', error);

        this.submitError =
          error?.error?.message || 'Category could not be created. Please try again.';

        this.isSubmitting = false;

        this.cdr.detectChanges();
      },
    });
  }

  private loadCategory(id: number): void {
    if (!this.hasPermission('CATEGORY_READ')) {
      return;
    }

    /*
     * Start loading.
     */
    this.isLoadingCategory = true;
    this.submitError = '';

    this.cdr.detectChanges();

    this.categoryService.getCategoryById(id).subscribe({
      next: (response) => {
        const category = response.data;

        /*
         * Fill form with API data.
         */
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description ?? '',
        });

        /*
         * Loading finished.
         */
        this.isLoadingCategory = false;

        /*
         * Force UI refresh.
         */
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Category loading failed:', error);

        this.submitError =
          error?.error?.message || 'Category could not be loaded. Please try again.';

        /*
         * Important:
         * Loading must stop even when API fails.
         */
        this.isLoadingCategory = false;

        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/categories']);
  }
}
