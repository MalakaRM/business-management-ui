import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { PermissionService } from '../../core/services/permission-service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  openReport(report: string): void {
    if (!this.hasPermission('REPORT_READ')) {
      return;
    }

    this.router.navigate(['/app/reports', report]);
  }
}
