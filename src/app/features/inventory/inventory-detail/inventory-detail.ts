import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InventoryService } from '../../../core/services/inventory-service';

import { Inventory as InventoryItem } from '../../../core/models/Inventory';

import { StockMovement } from '../../../core/models/StockMovement';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './inventory-detail.html',
  styleUrl: './inventory-detail.scss',
})
export class InventoryDetail implements OnInit {
  private readonly inventoryService = inject(InventoryService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  inventory: InventoryItem | null = null;

  movements: StockMovement[] = [];

  productId: number | null = null;

  isLoading = false;
  isLoadingMovements = false;

  errorMessage = '';
  movementErrorMessage = '';

  isEditingReorderLevel = false;
  reorderLevelValue = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('productId');

    if (!id) {
      this.router.navigate(['/app/inventory']);

      return;
    }

    this.productId = Number(id);

    this.loadInventory();
    this.loadMovements();
  }

  private loadInventory(): void {
    if (this.productId === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getInventory(this.productId).subscribe({
      next: (response) => {
        this.inventory = response.data;

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Inventory details loading failed:', error);

        this.inventory = null;

        this.errorMessage =
          error?.error?.message || 'Inventory details could not be loaded. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  private loadMovements(): void {
    if (this.productId === null) {
      return;
    }

    this.isLoadingMovements = true;
    this.movementErrorMessage = '';

    this.inventoryService.getStockMovements(this.productId).subscribe({
      next: (response) => {
        this.movements = response.data;

        this.isLoadingMovements = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Stock movements loading failed:', error);

        this.movements = [];

        this.movementErrorMessage = error?.error?.message || 'Stock movements could not be loaded.';

        this.isLoadingMovements = false;

        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/inventory']);
  }

  getMovementLabel(type: StockMovement['type']): string {
    switch (type) {
      case 'PURCHASE':
        return 'Purchase';

      case 'SALE':
        return 'Sale';

      case 'DAMAGE':
        return 'Damage';

      case 'ADJUSTMENT':
        return 'Adjustment';

      default:
        return type;
    }
  }

  getMovementIcon(type: StockMovement['type']): string {
    switch (type) {
      case 'PURCHASE':
        return 'bi-box-arrow-in-down';

      case 'SALE':
        return 'bi-box-arrow-up';

      case 'DAMAGE':
        return 'bi-exclamation-triangle';

      case 'ADJUSTMENT':
        return 'bi-sliders';

      default:
        return 'bi-arrow-left-right';
    }
  }

  getMovementClass(type: StockMovement['type']): string {
    switch (type) {
      case 'PURCHASE':
        return 'movement-purchase';

      case 'SALE':
        return 'movement-sale';

      case 'DAMAGE':
        return 'movement-damage';

      case 'ADJUSTMENT':
        return 'movement-adjustment';

      default:
        return '';
    }
  }

  //re orderlevel
  startReorderLevelEdit(): void {
    if (!this.inventory) {
      return;
    }

    this.reorderLevelValue = this.inventory.reorderLevel;
    this.isEditingReorderLevel = true;
  }

  cancelReorderLevelEdit(): void {
    this.isEditingReorderLevel = false;
    this.reorderLevelValue = 0;
  }

  //edit re order
  saveReorderLevel(): void {
    if (!this.inventory) {
      return;
    }

    if (!Number.isInteger(this.reorderLevelValue) || this.reorderLevelValue < 0) {
      this.errorMessage = 'Please enter a valid reorder level.';
      return;
    }

    this.inventoryService
      .updateReorderLevel(this.inventory.productId, {
        reorderLevel: this.reorderLevelValue,
      })
      .subscribe({
        next: (response) => {
          this.inventory = response.data;

          this.isEditingReorderLevel = false;
          this.reorderLevelValue = 0;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Reorder level update failed:', error);

          this.errorMessage =
            error?.error?.message || 'Reorder level could not be updated. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }
}
