import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  changePasswordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  showCurrentPassword = false;
  showNewPassword = false;
  isLoading = false;
  changePasswordError = '';

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.changePasswordError = '';

    this.authService.changePassword(this.changePasswordForm.getRawValue()).subscribe({
      next: () => {
        localStorage.setItem('password_change_required', 'false');

        this.isLoading = false;
        this.router.navigate(['/app/dashboard']);
      },

      error: (error) => {
        console.error('Password change failed:', error);

        this.changePasswordError =
          error?.error?.message || 'Failed to change password. Please try again.';

        this.isLoading = false;
      },
    });
  }
}
