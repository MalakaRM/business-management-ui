import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RoleService } from '../../core/services/role-service';

import { PermissionResponse, RoleResponse } from '../../core/models/role-management';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-management.html',
  styleUrl: './role-management.scss',
})
export class RoleManagement implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly cdr = inject(ChangeDetectorRef);

  roles: RoleResponse[] = [];
  permissions: PermissionResponse[] = [];

  isLoadingRoles = false;
  isLoadingPermissions = false;
  isSaving = false;

  successMessage = '';
  errorMessage = '';

  selectedRoleId: number | null = null;
  selectedPermissionIds = new Set<number>();

  roleForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],

    description: ['', [Validators.maxLength(255)]],
  });

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.isLoadingRoles = true;

    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        this.roles = response.data;
        this.isLoadingRoles = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load roles:', error);

        this.errorMessage = error?.error?.message || 'Failed to load roles. Please try again.';

        this.isLoadingRoles = false;

        this.cdr.detectChanges();
      },
    });
  }

  loadPermissions(): void {
    this.isLoadingPermissions = true;

    this.roleService.getAllPermissions().subscribe({
      next: (response) => {
        this.permissions = response.data;
        this.isLoadingPermissions = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load permissions:', error);

        this.errorMessage =
          error?.error?.message || 'Failed to load permissions. Please try again.';

        this.isLoadingPermissions = false;

        this.cdr.detectChanges();
      },
    });
  }

  selectRole(role: RoleResponse): void {
    this.selectedRoleId = role.id;

    this.selectedPermissionIds.clear();

    const rolePermissionNames = new Set(role.permissions);

    this.permissions.forEach((permission) => {
      if (rolePermissionNames.has(permission.name)) {
        this.selectedPermissionIds.add(permission.id);
      }
    });

    this.clearMessages();

    this.cdr.detectChanges();
  }

  togglePermission(permissionId: number): void {
    if (this.selectedPermissionIds.has(permissionId)) {
      this.selectedPermissionIds.delete(permissionId);
    } else {
      this.selectedPermissionIds.add(permissionId);
    }

    this.cdr.detectChanges();
  }

  createRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    this.cdr.detectChanges();

    this.roleService.createRole(this.roleForm.getRawValue()).subscribe({
      next: (response) => {
        this.successMessage = `Role "${response.data.name}" created successfully.`;

        this.roleForm.reset({
          name: '',
          description: '',
        });

        this.isSaving = false;

        this.loadRoles();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Role creation failed:', error);

        this.errorMessage = error?.error?.message || 'Failed to create role. Please try again.';

        this.isSaving = false;

        this.cdr.detectChanges();
      },
    });
  }

  savePermissions(): void {
    if (this.selectedRoleId === null) {
      return;
    }

    this.isSaving = true;
    this.clearMessages();

    const permissionIds = Array.from(this.selectedPermissionIds);

    this.cdr.detectChanges();

    this.roleService.assignPermissions(this.selectedRoleId, permissionIds).subscribe({
      next: (response) => {
        this.successMessage = `Permissions updated for "${response.data.name}".`;

        this.roles = this.roles.map((role) =>
          role.id === response.data.id ? response.data : role,
        );

        this.isSaving = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Permission update failed:', error);

        this.errorMessage =
          error?.error?.message || 'Failed to update permissions. Please try again.';

        this.isSaving = false;

        this.cdr.detectChanges();
      },
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
