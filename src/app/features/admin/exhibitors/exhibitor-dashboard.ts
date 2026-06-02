import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { toSignal } from '@angular/core/rxjs-interop';
import { Exhibitor } from '../../../core/models/exhibitor.model';
import { SPExhibitor } from '../../../core/services/supabase/sb-exhibitor';
import { ExhibitorTable } from './components/exhibitor-table/exhibitor-table';
import {
  ExhibitorFormModal,
  ExhibitorFormData,
} from './components/exhibitor-form-modal/exhibitor-form-modal';
import { ExhibitorDetailModal } from './components/exhibitor-detail-modal/exhibitor-detail-modal';
import { ExhibitorDeleteConfirmModal } from './components/exhibitor-delete-confirm-modal/exhibitor-delete-confirm-modal';

@Component({
  selector: 'app-exhibitor-dashboard',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ExhibitorTable,
  ],
  templateUrl: './exhibitor-dashboard.html',
  styleUrl: './exhibitor-dashboard.scss',
})
export class ExhibitorDashboard {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private service = inject(SPExhibitor);

  readonly exhibitors = toSignal(this.service.listen(), { initialValue: [] });
  readonly searchTerm = signal('');

  readonly filteredExhibitors = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.exhibitors();
    return this.exhibitors().filter(
      (e) =>
        (e.company_name ?? '').toLowerCase().includes(term) ||
        (e.sector ?? '').toLowerCase().includes(term) ||
        (e.edition?.name ?? '').toLowerCase().includes(term),
    );
  });

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openCreateModal(): void {
    const ref = this.dialog.open(ExhibitorFormModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: {} satisfies ExhibitorFormData,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.add(result as Exhibitor).subscribe({
        next: () => this.snackBar.open('Expositor registrado correctamente', 'Cerrar', { duration: 3000 }),
        error: () => this.snackBar.open('Error al registrar el expositor', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  onEdit(exhibitor: Exhibitor): void {
    const ref = this.dialog.open(ExhibitorFormModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: { exhibitor } satisfies ExhibitorFormData,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.service.update({ ...exhibitor, ...result }).subscribe({
        next: () => this.snackBar.open('Expositor actualizado correctamente', 'Cerrar', { duration: 3000 }),
        error: () => this.snackBar.open('Error al actualizar el expositor', 'Cerrar', { duration: 4000 }),
      });
    });
  }

  onView(exhibitor: Exhibitor): void {
    this.dialog.open(ExhibitorDetailModal, {
      hasBackdrop: false,
      panelClass: 'floating-dialog-panel',
      data: exhibitor,
    });
  }

  onDelete(exhibitor: Exhibitor): void {
    const ref = this.dialog.open(ExhibitorDeleteConfirmModal, {
      width: '28rem',
      maxWidth: '95vw',
      data: exhibitor,
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.service.delete(exhibitor.id).subscribe({
        next: () => this.snackBar.open('Expositor eliminado', 'Cerrar', { duration: 3000 }),
        error: () => this.snackBar.open('Error al eliminar el expositor', 'Cerrar', { duration: 4000 }),
      });
    });
  }
}
