import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { PermissionService } from '../services/permission-service';

export const permissionGuard = (
  requiredPermission: string,
): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const permissionService = inject(PermissionService);

    if (
      permissionService.hasPermission(requiredPermission)
    ) {
      return true;
    }

    return router.createUrlTree(['/404']);
  };
};
