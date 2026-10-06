import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { ChangePassword } from './features/auth/change-password/change-password';

import { authGuard } from './core/guards/auth-guard';
import { permissionGuard } from './core/guards/permission-guard-guard';

import { UserManagement } from './features/users/user-managemnt/user-managemnt';
import { RoleManagement } from './features/role-management/role-management';

export const routes: Routes = [
  // =========================================================
  // PUBLIC
  // =========================================================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'change-password',
    component: ChangePassword,
  },

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  {
    path: 'app',

    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),

    canActivate: [authGuard],

    children: [
      // =======================================================
      // DEFAULT
      // =======================================================

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // =======================================================
      // DASHBOARD
      // =======================================================

      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },

      // =======================================================
      // AUDIT LOGS
      // =======================================================

      {
        path: 'audit-logs',

        loadComponent: () => import('./features/audit/audit-log/audit-log').then((m) => m.AuditLog),

        canActivate: [permissionGuard('AUDIT_READ')],
      },

      // =======================================================
      // USER MANAGEMENT
      // =======================================================

      {
        path: 'users',

        component: UserManagement,

        canActivate: [permissionGuard('USER_MANAGE')],
      },

      // =======================================================
      // ROLE MANAGEMENT
      // =======================================================

      {
        path: 'roles',

        component: RoleManagement,

        canActivate: [permissionGuard('ROLE_MANAGE')],
      },

      // =======================================================
      // PRODUCTS
      // =======================================================

      {
        path: 'products',

        loadComponent: () =>
          import('./features/products/products-list/products-list').then((m) => m.ProductsList),

        canActivate: [permissionGuard('PRODUCT_READ')],
      },

      {
        path: 'products/new',

        loadComponent: () =>
          import('./features/products/product-form/product-form').then((m) => m.ProductForm),

        canActivate: [permissionGuard('PRODUCT_CREATE')],
      },

      {
        path: 'products/edit/:id',

        loadComponent: () =>
          import('./features/products/product-form/product-form').then((m) => m.ProductForm),

        canActivate: [permissionGuard('PRODUCT_UPDATE')],
      },

      // =======================================================
      // CATEGORIES
      // =======================================================

      {
        path: 'categories',

        loadComponent: () =>
          import('./features/categories/categories-list/categories-list').then(
            (m) => m.CategoriesList,
          ),

        canActivate: [permissionGuard('CATEGORY_READ')],
      },

      {
        path: 'categories/new',

        loadComponent: () =>
          import('./features/categories/categories-form/categories-form').then(
            (m) => m.CategoriesForm,
          ),

        canActivate: [permissionGuard('CATEGORY_CREATE')],
      },

      {
        path: 'categories/edit/:id',

        loadComponent: () =>
          import('./features/categories/categories-form/categories-form').then(
            (m) => m.CategoriesForm,
          ),

        canActivate: [permissionGuard('CATEGORY_UPDATE')],
      },

      // =======================================================
      // CUSTOMERS
      // =======================================================

      {
        path: 'customers',

        loadComponent: () =>
          import('./features/customers/customers-list/customers-list').then((m) => m.CustomersList),

        canActivate: [permissionGuard('CUSTOMER_READ')],
      },

      {
        path: 'customers/new',

        loadComponent: () =>
          import('./features/customers/customer-form/customer-form').then((m) => m.CustomerForm),

        canActivate: [permissionGuard('CUSTOMER_CREATE')],
      },

      {
        path: 'customers/edit/:id',

        loadComponent: () =>
          import('./features/customers/customer-form/customer-form').then((m) => m.CustomerForm),

        canActivate: [permissionGuard('CUSTOMER_UPDATE')],
      },

      // =======================================================
      // SUPPLIERS
      // =======================================================

      {
        path: 'suppliers',

        loadComponent: () =>
          import('./features/suppliers/suppliers-list/suppliers-list').then((m) => m.SuppliersList),

        canActivate: [permissionGuard('SUPPLIER_READ')],
      },

      {
        path: 'suppliers/new',

        loadComponent: () =>
          import('./features/suppliers/supplier-form/supplier-form').then((m) => m.SupplierForm),

        canActivate: [permissionGuard('SUPPLIER_CREATE')],
      },

      {
        path: 'suppliers/edit/:id',

        loadComponent: () =>
          import('./features/suppliers/supplier-form/supplier-form').then((m) => m.SupplierForm),

        canActivate: [permissionGuard('SUPPLIER_UPDATE')],
      },

      // =======================================================
      // INVENTORY
      // =======================================================

      {
        path: 'inventory',

        loadComponent: () =>
          import('./features/inventory/inventory/inventory').then((m) => m.Inventory),

        canActivate: [permissionGuard('INVENTORY_READ')],
      },

      {
        path: 'inventory/:productId',

        loadComponent: () =>
          import('./features/inventory/inventory-detail/inventory-detail').then(
            (m) => m.InventoryDetail,
          ),

        canActivate: [permissionGuard('INVENTORY_READ')],
      },

      // =======================================================
      // PURCHASES
      // =======================================================

      {
        path: 'purchases',

        loadComponent: () =>
          import('./features/purchases/purchases-list/purchases-list').then((m) => m.PurchasesList),

        canActivate: [permissionGuard('PURCHASE_READ')],
      },

      {
        path: 'purchases/new',

        loadComponent: () =>
          import('./features/purchases/purchase-form/purchase-form').then((m) => m.PurchaseForm),

        canActivate: [permissionGuard('PURCHASE_CREATE')],
      },

      {
        path: 'purchases/edit/:id',

        loadComponent: () =>
          import('./features/purchases/purchase-form/purchase-form').then((m) => m.PurchaseForm),

        canActivate: [permissionGuard('PURCHASE_UPDATE')],
      },

      {
        path: 'purchases/:id',

        loadComponent: () =>
          import('./features/purchases/purchase-detail/purchase-detail').then(
            (m) => m.PurchaseDetail,
          ),

        canActivate: [permissionGuard('PURCHASE_READ')],
      },

      // =======================================================
      // ORDERS
      // =======================================================

      {
        path: 'orders',

        loadComponent: () =>
          import('./features/orders/orders-list/orders-list').then((m) => m.OrdersList),

        canActivate: [permissionGuard('ORDER_READ')],
      },

      {
        path: 'orders/new',

        loadComponent: () =>
          import('./features/orders/order-form/order-form').then((m) => m.OrderForm),

        canActivate: [permissionGuard('ORDER_CREATE')],
      },

      {
        path: 'orders/edit/:id',

        loadComponent: () =>
          import('./features/orders/order-form/order-form').then((m) => m.OrderForm),

        canActivate: [permissionGuard('ORDER_UPDATE')],
      },

      {
        path: 'orders/:id',

        loadComponent: () =>
          import('./features/orders/order-detail/order-detail').then((m) => m.OrderDetail),

        canActivate: [permissionGuard('ORDER_READ')],
      },

      // =======================================================
      // POS
      // =======================================================

      {
        path: 'pos',

        loadComponent: () => import('./layout/pos-layout/pos-layout').then((m) => m.PosLayout),

        canActivate: [permissionGuard('ORDER_CREATE')],

        children: [
          // ---------------------------------------------------
          // POS MAIN
          // ---------------------------------------------------

          {
            path: '',

            loadComponent: () => import('./features/pos/pos/pos').then((m) => m.Pos),
          },

          // ---------------------------------------------------
          // PAYMENT
          // ---------------------------------------------------

          {
            path: 'payment',

            loadComponent: () => import('./features/pos/payment/payment').then((m) => m.Payment),
          },

          // ---------------------------------------------------
          // BILL
          // ---------------------------------------------------

          {
            path: 'bill',

            loadComponent: () => import('./features/pos/bill/bill').then((m) => m.Bill),
          },
        ],
      },

      // =======================================================
      // REPORTS
      // =======================================================

      {
        path: 'reports',

        canActivate: [permissionGuard('REPORT_READ')],

        children: [
          // ---------------------------------------------------
          // REPORT HOME
          // ---------------------------------------------------

          {
            path: '',

            loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
          },

          // ---------------------------------------------------
          // SALES REPORT
          // ---------------------------------------------------

          {
            path: 'sales',

            loadComponent: () =>
              import('./pages/reports/sales-report/sales-report').then((m) => m.SalesReport),
          },

          // ---------------------------------------------------
          // PURCHASE REPORT
          // ---------------------------------------------------

          {
            path: 'purchases',

            loadComponent: () =>
              import('./pages/reports/purchase-report/purchase-report').then(
                (m) => m.PurchaseReport,
              ),
          },

          // ---------------------------------------------------
          // INVENTORY REPORT
          // ---------------------------------------------------

          {
            path: 'inventory',

            loadComponent: () =>
              import('./pages/reports/inventory-report/inventory-report').then(
                (m) => m.InventoryReport,
              ),
          },

          // ---------------------------------------------------
          // LOW STOCK REPORT
          // ---------------------------------------------------

          {
            path: 'low-stock-report',

            loadComponent: () =>
              import('./pages/reports/low-stock-report/low-stock-report').then(
                (m) => m.LowStockReport,
              ),
          },
        ],
      },
    ],
  },

  // =========================================================
  // POS FULLSCREEN
  // =========================================================

  {
    path: 'pos/fullscreen',

    loadComponent: () =>
      import('./features/pos/pos-fullscreen/pos-fullscreen').then((m) => m.PosFullscreen),

    canActivate: [authGuard, permissionGuard('ORDER_CREATE')],
  },

  // =========================================================
  // 404
  // =========================================================

  {
    path: '404',

    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },

  // =========================================================
  // WILDCARD
  // =========================================================

  {
    path: '**',

    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
