import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FairEdition } from '../../../../../core/models/fair-edition.model';

@Component({
  selector: 'app-fair-edition-delete-confirm-modal',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './fair-edition-delete-confirm-modal.html',
  styleUrl: './fair-edition-delete-confirm-modal.scss',
})
export class FairEditionDeleteConfirmModal {
  private dialogRef = inject(MatDialogRef<FairEditionDeleteConfirmModal>);
  readonly edition: FairEdition = inject(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
