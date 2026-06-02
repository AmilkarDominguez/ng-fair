import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { Category } from '../../../core/models/category.model';
import { SPCategory } from '../../../core/services/supabase/sb-category';
import { CategoryTable } from './components/category-table/category-table';
import {
  CategoryFormModal,
  CategoryFormData,
} from './components/category-form-modal/category-form-modal';
import { CategoryDetailModal } from './components/category-detail-modal/category-detail-modal';
import { CategoryDeleteConfirmModal } from './components/category-delete-confirm-modal/category-delete-confirm-modal';

@Component({
  selector: 'app-category-dashboard',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    CategoryTable,
  ],
  templateUrl: './category-dashboard.html',
  styleUrl: './category-dashboard.scss',
})
export class CategoryDashboard {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private service = inject(SPCategory);

  readonly categories = toSignal(this.service.listen(), { initialValue: [] });
  readonly searchTerm = signal('');

  readonly filteredCategories = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.categories();
    return this.categories().filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.description ?? '').toLowerCase().includes(term),
    );
  });

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openCreateModal(): void {
    const ref = this.dialog.open(CategoryFormModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: {} satisfies CategoryFormData,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.add(result as Category).subscribe(() => {
        this.snackBar.open('Categoría registrada correctamente', 'Cerrar', { duration: 3000 });
      });
    });
  }

  onEdit(category: Category): void {
    const ref = this.dialog.open(CategoryFormModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: { category } satisfies CategoryFormData,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.update({ ...category, ...result }).subscribe(() => {
        this.snackBar.open('Categoría actualizada correctamente', 'Cerrar', { duration: 3000 });
      });
    });
  }

  onView(category: Category): void {
    this.dialog.open(CategoryDetailModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: category,
    });
  }

  onDelete(category: Category): void {
    const ref = this.dialog.open(CategoryDeleteConfirmModal, {
      width: '28rem',
      maxWidth: '95vw',
      data: category,
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.service.delete(category.id).subscribe(() => {
        this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 3000 });
      });
    });
  }
}
