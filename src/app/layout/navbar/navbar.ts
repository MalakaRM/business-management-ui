import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  pageTitle = 'Dashboard';
  isUserMenuOpen = false;

  username = localStorage.getItem('username') || 'User';

  private readonly pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    customers: 'Customers',
    suppliers: 'Suppliers',
    inventory: 'Inventory',
    purchases: 'Purchases',
    orders: 'Orders',
    pos: 'Point of Sale',
    reports: 'Reports',
    sales: 'Sales Report',
    'purchase-report': 'Purchase Report',
    'inventory-report': 'Inventory Report',
    'low-stock-report': 'Low Stock Report',
    users: 'User Management',
    roles: 'Roles & Permissions',
    'audit-logs': 'Audit Logs',
  };

  constructor() {
    this.updatePageTitle(this.router.url);

this.router.events
  .pipe(filter((event) => event instanceof NavigationEnd))
  .subscribe((event) => {
    this.updatePageTitle(event.urlAfterRedirects);
    this.isUserMenuOpen = false;
  });

  }

  get userInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }

  private updatePageTitle(url: string): void {
    const routeSegments = url.split('?')[0].split('#')[0].split('/').filter(Boolean);

const currentRoute =
  routeSegments.length > 0
    ? routeSegments[routeSegments.length - 1]
    : 'dashboard';

this.pageTitle =
  this.pageTitles[currentRoute] ??
  this.pageTitles[routeSegments[0]] ??
  'Dashboard';

  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    localStorage.removeItem('permissions');
    localStorage.removeItem('password_change_required');


this.isUserMenuOpen = false;

this.router.navigate(['/login']);

  }
}
