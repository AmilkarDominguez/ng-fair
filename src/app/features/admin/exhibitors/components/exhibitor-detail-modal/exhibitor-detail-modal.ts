import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Exhibitor } from '../../../../../core/models/exhibitor.model';
import { DialogFrame } from '../../../../../shared/components/dialog-frame/dialog-frame';

@Component({
  selector: 'app-exhibitor-detail-modal',
  imports: [
    DatePipe,
    DialogFrame,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './exhibitor-detail-modal.html',
  styleUrl: './exhibitor-detail-modal.scss',
})
export class ExhibitorDetailModal {
  private dialogRef = inject(MatDialogRef<ExhibitorDetailModal>);
  readonly exhibitor: Exhibitor = inject(MAT_DIALOG_DATA);

  get displayName(): string {
    return this.exhibitor.company_name || this.exhibitor.user?.name || '—';
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onPrint(): void {
    window.print();
  }
}
