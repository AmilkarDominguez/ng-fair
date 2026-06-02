import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DialogFrame } from '../../../../../shared/components/dialog-frame/dialog-frame';
import { FairEdition } from '../../../../../core/models/fair-edition.model';

export interface FairEditionFormData {
  edition?: FairEdition;
}

function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('start_date')?.value;
  const end = control.get('end_date')?.value;
  if (start && end && end < start) {
    return { dateRange: true };
  }
  return null;
}

@Component({
  selector: 'app-fair-edition-form-modal',
  imports: [
    ReactiveFormsModule,
    DialogFrame,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  templateUrl: './fair-edition-form-modal.html',
  styleUrl: './fair-edition-form-modal.scss',
})
export class FairEditionFormModal implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FairEditionFormModal>);
  private data: FairEditionFormData = inject(MAT_DIALOG_DATA);

  get isEditMode(): boolean {
    return !!this.data?.edition;
  }

  get dateRangeError(): boolean {
    return this.form.hasError('dateRange') && this.form.touched;
  }

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.maxLength(200)]],
      start_date: [''],
      end_date: [''],
      active: [true],
    },
    { validators: dateRangeValidator },
  );

  ngOnInit(): void {
    if (this.data?.edition) {
      this.form.patchValue({
        name: this.data.edition.name,
        start_date: this.data.edition.start_date ?? '',
        end_date: this.data.edition.end_date ?? '',
        active: this.data.edition.state === 'ACTIVE',
      });
    }
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;
    this.dialogRef.close({
      name: raw.name!,
      start_date: raw.start_date || null,
      end_date: raw.end_date || null,
      state: raw.active ? 'ACTIVE' : 'INACTIVE',
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }
}
