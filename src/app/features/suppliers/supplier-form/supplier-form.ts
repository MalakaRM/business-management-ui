import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { SupplierService } from '../../../core/services/supplier-service';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-form.html',
  styleUrl: './supplier-form.scss',
})
export class SupplierForm implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly supplierService = inject(SupplierService);

  private readonly notificationService = inject(NotificationService);

  private readonly permissionService = inject(PermissionService);

  private readonly router = inject(Router);

  private readonly route = inject(ActivatedRoute);

  private readonly cdr = inject(ChangeDetectorRef);

  isSubmitting = false;
  isLoadingSupplier = false;

  submitError = '';

  isEditMode = false;
  supplierId: number | null = null;

  supplierForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],

    email: ['', [Validators.email, Validators.maxLength(150)]],

    phone: ['', [Validators.maxLength(30)]],

    address: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;

      const numericId = Number(id);

      if (Number.isNaN(numericId) || numericId <= 0) {
        this.submitError = 'Invalid supplier ID.';
        return;
      }

      this.supplierId = numericId;

      if (!this.hasPermission('SUPPLIER_READ')) {
        this.submitError = 'You do not have permission to view this supplier.';

        return;
      }

      this.loadSupplier(this.supplierId);

      return;
    }

    if (!this.hasPermission('SUPPLIER_CREATE')) {
      this.submitError = 'You do not have permission to create suppliers.';
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadSupplier(id: number): void {
    if (!this.hasPermission('SUPPLIER_READ')) {
      return;
    }

    this.isLoadingSupplier = true;
    this.submitError = '';

    this.cdr.detectChanges();

    this.supplierService.getSupplierById(id).subscribe({
      next: (response) => {
        const supplier = response.data;

        this.supplierForm.patchValue({
          name: supplier.name,
          email: supplier.email ?? '',
          phone: supplier.phone ?? '',
          address: supplier.address ?? '',
        });

        this.isLoadingSupplier = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Supplier loading failed:', error);

        this.submitError =
          error?.error?.message || 'Supplier could not be loaded. Please try again.';

        this.isLoadingSupplier = false;

        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    const requiredPermission = this.isEditMode ? 'SUPPLIER_UPDATE' : 'SUPPLIER_CREATE';

    if (!this.hasPermission(requiredPermission)) {
      this.submitError = this.isEditMode
        ? 'You do not have permission to update suppliers.'
        : 'You do not have permission to create suppliers.';

      return;
    }

    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();

      return;
    }

    if (this.isEditMode && this.supplierId === null) {
      this.submitError = 'Invalid supplier information.';

      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const request = this.supplierForm.getRawValue();

    if (this.isEditMode && this.supplierId !== null) {
      this.supplierService.updateSupplier(this.supplierId, request).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.notificationService.success('Supplier updated successfully.');

          this.router.navigate(['/app/suppliers']);
        },

        error: (error) => {
          console.error('Supplier update failed:', error);

          this.submitError =
            error?.error?.message || 'Supplier could not be updated. Please try again.';

          this.isSubmitting = false;

          this.cdr.detectChanges();
        },
      });
    } else {
      this.supplierService.createSupplier(request).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.notificationService.success('Supplier created successfully.');

          this.router.navigate(['/app/suppliers']);
        },

        error: (error) => {
          console.error('Supplier creation failed:', error);

          this.submitError =
            error?.error?.message || 'Supplier could not be created. Please try again.';

          this.isSubmitting = false;

          this.cdr.detectChanges();
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/app/suppliers']);
  }
}
