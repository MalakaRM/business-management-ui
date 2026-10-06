import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../../core/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  showPassword = false;
  isLoading = false;
  loginError = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        console.log('Login successful:', response);

        localStorage.setItem(
          'access_token',
          response.data.token,
        );

        localStorage.setItem(
          'username',
          response.data.username,
        );

        localStorage.setItem(
          'roles',
          JSON.stringify(response.data.roles),
        );

        localStorage.setItem(
          'permissions',
          JSON.stringify(response.data.permissions),
        );

        localStorage.setItem(
          'password_change_required',
          String(response.data.passwordChangeRequired),
        );

        this.isLoading = false;

        if (response.data.passwordChangeRequired) {
          this.router.navigate(['/change-password']);
        } else {
          this.router.navigate(['/app/dashboard']);
        }
      },

      error: (error) => {
        console.error('Login failed:', error);

        this.loginError =
          'Invalid username or password.';

        this.isLoading = false;
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}

