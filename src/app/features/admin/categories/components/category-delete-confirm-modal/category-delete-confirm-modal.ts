import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../../../../core/models/category.model';

@Component({
  selector: 'app-category-delete-confirm-modal',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './category-delete-confirm-modal.html',
  styleUrl: './category-delete-confirm-modal.scss',
})
export class CategoryDeleteConfirmModal {
  private dialogRef = inject(MatDialogRef<CategoryDeleteConfirmModal>);
  readonly category: Category = inject(MAT_DIALOG_DATA);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
