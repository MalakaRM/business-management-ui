import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InventoryService } from '../../../core/services/inventory-service';
import { PermissionService } from '../../../core/services/permission-service';
import { Inventory as InventoryItem } from '../../../core/models/Inventory';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly permissionService = inject(PermissionService);
  private readonly cdr = inject(ChangeDetectorRef);

  inventory: InventoryItem[] = [];

  isLoading = false;
  errorMessage = '';

  searchTerm = '';

  currentPage = 0;
  pageSize = 10;

  totalPages = 0;
  totalElements = 0;

  // Stock adjustment
  showAdjustmentModal = false;

  selectedInventory: InventoryItem | null = null;

  adjustmentQuantity = 0;
  adjustmentReason = '';

  isAdjusting = false;

  ngOnInit(): void {
    this.loadInventory();
  }

  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  private loadInventory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getAllInventory(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const pageData = response.data;

        this.inventory = pageData.content;
        this.totalPages = pageData.totalPages;
        this.totalElements = pageData.totalElements;
        this.currentPage = pageData.number;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Inventory loading failed:', error);

        this.inventory = [];
        this.totalPages = 0;
        this.totalElements = 0;

        this.errorMessage =
          error?.error?.message || 'Inventory could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  get filteredInventory(): InventoryItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.inventory;
    }

    return this.inventory.filter((item) => item.productName.toLowerCase().includes(term));
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;

    this.loadInventory();
  }

  get pageNumbers(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },
      (_, index) => index,
    );
  }

  get lowStockCount(): number {
    return this.inventory.filter((item) => item.lowStock).length;
  }

  get totalStock(): number {
    return this.inventory.reduce((total, item) => total + item.quantity, 0);
  }

  // Stock adjustment
  openAdjustment(item: InventoryItem): void {
    if (!this.hasPermission('INVENTORY_UPDATE')) {
      return;
    }

    this.selectedInventory = item;
    this.adjustmentQuantity = item.quantity;
    this.adjustmentReason = '';
    this.showAdjustmentModal = true;
  }

  closeAdjustment(): void {
    if (this.isAdjusting) {
      return;
    }

    this.showAdjustmentModal = false;
    this.selectedInventory = null;
    this.adjustmentQuantity = 0;
    this.adjustmentReason = '';
  }

  submitAdjustment(): void {
    if (!this.hasPermission('INVENTORY_UPDATE')) {
      return;
    }

    if (!this.selectedInventory) {
      return;
    }

    const reason = this.adjustmentReason.trim();

    if (this.adjustmentQuantity < 0 || !Number.isInteger(this.adjustmentQuantity)) {
      this.errorMessage = 'Please enter a valid stock quantity.';
      return;
    }

    if (!reason || reason.length < 3) {
      this.errorMessage = 'Please provide a valid reason for the adjustment.';
      return;
    }

    this.isAdjusting = true;
    this.errorMessage = '';

    this.inventoryService
      .adjustStock({
        productId: this.selectedInventory.productId,
        newQuantity: this.adjustmentQuantity,
        reason,
      })
      .subscribe({
        next: () => {
          this.isAdjusting = false;

          this.closeAdjustment();

          this.loadInventory();
        },

        error: (error) => {
          console.error('Stock adjustment failed:', error);

          this.isAdjusting = false;

          this.errorMessage = error?.error?.message || 'Stock adjustment failed. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }
}
