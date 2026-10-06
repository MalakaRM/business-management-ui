import { Component, inject } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { PermissionService } from '../../core/services/permission-service';

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLinkActive,
    RouterLink,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  private readonly permissionService =
    inject(PermissionService);

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }
}

