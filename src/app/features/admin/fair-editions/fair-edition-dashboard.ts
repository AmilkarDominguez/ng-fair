import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { FairEdition } from '../../../core/models/fair-edition.model';
import { SPFairEdition } from '../../../core/services/supabase/sb-fair-edition';
import { FairEditionTable } from './components/fair-edition-table/fair-edition-table';
import {
  FairEditionFormModal,
  FairEditionFormData,
} from './components/fair-edition-form-modal/fair-edition-form-modal';
import { FairEditionDetailModal } from './components/fair-edition-detail-modal/fair-edition-detail-modal';
import { FairEditionDeleteConfirmModal } from './components/fair-edition-delete-confirm-modal/fair-edition-delete-confirm-modal';

@Component({
  selector: 'app-fair-edition-dashboard',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FairEditionTable,
  ],
  templateUrl: './fair-edition-dashboard.html',
  styleUrl: './fair-edition-dashboard.scss',
})
export class FairEditionDashboard {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private service = inject(SPFairEdition);

  readonly editions = toSignal(this.service.listen(), { initialValue: [] });
  readonly searchTerm = signal('');

  readonly filteredEditions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.editions();
    return this.editions().filter((e) =>
      e.name.toLowerCase().includes(term),
    );
  });

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openCreateModal(): void {
    const ref = this.dialog.open(FairEditionFormModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: {} satisfies FairEditionFormData,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.add(result as FairEdition).subscribe(() => {
        this.snackBar.open('Edición registrada correctamente', 'Cerrar', { duration: 3000 });
      });
    });
  }

  onEdit(edition: FairEdition): void {
    const ref = this.dialog.open(FairEditionFormModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: { edition } satisfies FairEditionFormData,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.update({ ...edition, ...result }).subscribe(() => {
        this.snackBar.open('Edición actualizada correctamente', 'Cerrar', { duration: 3000 });
      });
    });
  }

  onView(edition: FairEdition): void {
    this.dialog.open(FairEditionDetailModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: edition,
    });
  }

  onDelete(edition: FairEdition): void {
    const ref = this.dialog.open(FairEditionDeleteConfirmModal, {
      width: '28rem',
      maxWidth: '95vw',
      data: edition,
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.service.delete(edition.id).subscribe(() => {
        this.snackBar.open('Edición eliminada', 'Cerrar', { duration: 3000 });
      });
    });
  }
}
