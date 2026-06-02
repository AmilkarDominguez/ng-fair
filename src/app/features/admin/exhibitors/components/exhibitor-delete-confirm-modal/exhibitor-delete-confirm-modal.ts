import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Exhibitor } from '../../../../../core/models/exhibitor.model';

@Component({
  selector: 'app-exhibitor-delete-confirm-modal',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './exhibitor-delete-confirm-modal.html',
  styleUrl: './exhibitor-delete-confirm-modal.scss',
})
export class ExhibitorDeleteConfirmModal {
  private dialogRef = inject(MatDialogRef<ExhibitorDeleteConfirmModal>);
  readonly exhibitor: Exhibitor = inject(MAT_DIALOG_DATA);

  get displayName(): string {
    return this.exhibitor.company_name || this.exhibitor.user?.name || this.exhibitor.user?.email || '—';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
