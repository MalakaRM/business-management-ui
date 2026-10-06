
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  private getPermissions(): string[] {
    const storedPermissions =
      localStorage.getItem('permissions');

    if (!storedPermissions) {
      return [];
    }

    try {
      return JSON.parse(storedPermissions);
    } catch {
      return [];
    }
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();

    return permissions.some((permission) =>
      userPermissions.includes(permission)
    );
  }

  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();

    return permissions.every((permission) =>
      userPermissions.includes(permission)
    );
  }
}
