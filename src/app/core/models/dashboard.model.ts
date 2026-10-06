export interface DashboardResponse {
  totalProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  currentStock: number;
  lowStockCount: number;
  pendingOrders: number;
  todaySales: number;
  todayPurchases: number;
  revenue: number;
}
