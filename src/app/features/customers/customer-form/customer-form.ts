import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CustomerService } from '../../../core/services/customer-service';
import { NotificationService } from '../../../core/services/notification-service';
import { PermissionService } from '../../../core/services/permission-service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss',
})
export class CustomerForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly notificationService = inject(NotificationService);
  private readonly permissionService = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isSubmitting = false;
  isLoadingCustomer = false;

  submitError = '';

  isEditMode = false;
  customerId: number | null = null;

  customerForm = this.fb.nonNullable.group({
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
        this.submitError = 'Invalid customer ID.';
        return;
      }

      this.customerId = numericId;

      if (!this.hasPermission('CUSTOMER_READ')) {
        this.submitError = 'You do not have permission to view this customer.';
        return;
      }

      this.loadCustomer(numericId);

      return;
    }

    if (!this.hasPermission('CUSTOMER_CREATE')) {
      this.submitError = 'You do not have permission to create customers.';
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  onSubmit(): void {
    const requiredPermission = this.isEditMode ? 'CUSTOMER_UPDATE' : 'CUSTOMER_CREATE';

    if (!this.hasPermission(requiredPermission)) {
      this.submitError = this.isEditMode
        ? 'You do not have permission to update customers.'
        : 'You do not have permission to create customers.';

      return;
    }

    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.customerId === null) {
      this.submitError = 'Invalid customer information.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const request = this.customerForm.getRawValue();

    if (this.isEditMode && this.customerId !== null) {
      this.customerService.updateCustomer(this.customerId, request).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.notificationService.success('Customer updated successfully.');

          this.router.navigate(['/app/customers']);
        },

        error: (error) => {
          console.error('Customer update failed:', error);

          this.submitError =
            error?.error?.message || 'Customer could not be updated. Please try again.';

          this.isSubmitting = false;
        },
      });

      return;
    }

    this.customerService.createCustomer(request).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.notificationService.success('Customer created successfully.');

        this.router.navigate(['/app/customers']);
      },

      error: (error) => {
        console.error('Customer creation failed:', error);

        this.submitError =
          error?.error?.message || 'Customer could not be created. Please try again.';

        this.isSubmitting = false;
      },
    });
  }

  private loadCustomer(id: number): void {
    if (!this.hasPermission('CUSTOMER_READ')) {
      return;
    }

    this.isLoadingCustomer = true;
    this.submitError = '';

    this.customerService.getCustomerById(id).subscribe({
      next: (response) => {
        const customer = response.data;

        this.customerForm.patchValue({
          name: customer.name,
          email: customer.email ?? '',
          phone: customer.phone ?? '',
          address: customer.address ?? '',
        });

        this.isLoadingCustomer = false;
      },

      error: (error) => {
        console.error('Customer loading failed:', error);

        this.submitError =
          error?.error?.message || 'Customer could not be loaded. Please try again.';

        this.isLoadingCustomer = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/customers']);
  }
}
