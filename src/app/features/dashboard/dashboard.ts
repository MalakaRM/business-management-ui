import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard-service';
import { SalesReportService } from '../../core/services/sales-report-service';
import { PurchaseReportService } from '../../core/services/purchase-report-service';
import { PermissionService } from '../../core/services/permission-service';

import { DashboardResponse } from '../../core/models/dashboard.model';
import { MonthlyAmount } from '../../core/models/MonthlyAmount';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly salesReportService = inject(SalesReportService);
  private readonly purchaseReportService = inject(PurchaseReportService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  dashboardData: DashboardResponse | null = null;

  currentDate = new Date();

  monthlySales: MonthlyAmount[] = [];
  monthlyPurchases: MonthlyAmount[] = [];

  isDashboardLoading = false;
  isSalesLoading = false;
  isPurchaseLoading = false;

  dashboardError = '';
  salesError = '';
  purchaseError = '';

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  salesChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        tension: 0.35,
        fill: true,
      },
    ],
  };

  salesChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  purchaseChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Purchases',
        data: [],
        tension: 0.35,
        fill: true,
      },
    ],
  };

  purchaseChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  private getCurrentYearRange(): { from: string; to: string } {
    const year = this.currentDate.getFullYear();

    return {
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    };
  }

  ngOnInit(): void {
    this.loadDashboard();

    if (this.hasPermission('ORDER_READ')) {
      this.loadMonthlySales();
    }

    if (this.hasPermission('PURCHASE_READ')) {
      this.loadMonthlyPurchases();
    }
  }

  private loadDashboard(): void {
    this.isDashboardLoading = true;
    this.dashboardError = '';

    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        this.dashboardData = response.data;
        this.isDashboardLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Dashboard loading failed:', error);

        this.dashboardError = 'Dashboard data could not be loaded.';

        this.isDashboardLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  private loadMonthlySales(): void {
    if (!this.hasPermission('ORDER_READ')) {
      return;
    }

    this.isSalesLoading = true;
    this.salesError = '';

    const { from, to } = this.getCurrentYearRange();

    this.salesReportService.getMonthlySales(from, to).subscribe({
      next: (response) => {
        this.monthlySales = response.data ?? [];

        this.updateSalesChart();

        this.isSalesLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Monthly sales loading failed:', error);

        this.salesError = 'Sales data could not be loaded.';

        this.isSalesLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  private loadMonthlyPurchases(): void {
    if (!this.hasPermission('PURCHASE_READ')) {
      return;
    }

    this.isPurchaseLoading = true;
    this.purchaseError = '';

    const { from, to } = this.getCurrentYearRange();

    this.purchaseReportService.getMonthlyPurchases(from, to).subscribe({
      next: (response) => {
        this.monthlyPurchases = response.data ?? [];

        this.updatePurchaseChart();

        this.isPurchaseLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Monthly purchases loading failed:', error);

        this.purchaseError = 'Purchase data could not be loaded.';

        this.isPurchaseLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  private updateSalesChart(): void {
    this.salesChartData = {
      labels: this.monthlySales.map((item) => item.month),

      datasets: [
        {
          label: 'Sales',
          data: this.monthlySales.map((item) => item.amount),
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }

  private updatePurchaseChart(): void {
    this.purchaseChartData = {
      labels: this.monthlyPurchases.map((item) => item.month),

      datasets: [
        {
          label: 'Purchases',
          data: this.monthlyPurchases.map((item) => item.amount),
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }
}
