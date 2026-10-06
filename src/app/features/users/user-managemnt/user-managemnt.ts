import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { UserService } from '../../../core/services/user-service';
import { RoleService } from '../../../core/services/role-service';

import { RoleResponse } from '../../../core/models/role-management';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-managemnt.html',
  styleUrl: './user-managemnt.scss',
})
export class UserManagement implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly cdr = inject(ChangeDetectorRef);

  roles: RoleResponse[] = [];

  isLoadingRoles = false;
  isLoading = false;

  showPassword = false;

  successMessage = '';
  errorMessage = '';

  userForm = this.fb.nonNullable.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
      ],
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
      ],
    ],

    role: [
      '',
      Validators.required,
    ],
  });

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.errorMessage = '';

    this.roleService.getAllRoles().subscribe({
      next: (response) => {
        this.roles = response.data;

        this.isLoadingRoles = false;

        /*
         * Set the first available role as the default
         * only when the form does not already have a role.
         */
        if (
          this.roles.length > 0 &&
          !this.userForm.controls.role.value
        ) {
          this.userForm.controls.role.setValue(
            this.roles[0].name,
          );
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'Failed to load roles:',
          error,
        );

        this.errorMessage =
          error?.error?.message ||
          'Failed to load roles. Please try again.';

        this.isLoadingRoles = false;

        this.cdr.detectChanges();
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService
      .createUser(this.userForm.getRawValue())
      .subscribe({
        next: (response) => {
          this.successMessage =
            `User "${response.data.username}" created successfully.`;

          /*
           * Keep the first available role selected
           * after successful user creation.
           */
          const defaultRole =
            this.roles.length > 0
              ? this.roles[0].name
              : '';

          this.userForm.reset({
            username: '',
            email: '',
            password: '',
            role: defaultRole,
          });

          this.showPassword = false;
          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'User creation failed:',
            error,
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to create user. Please try again.';

          this.isLoading = false;

          this.cdr.detectChanges();
        },
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}

