import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DialogFrame } from '../../../../../shared/components/dialog-frame/dialog-frame';
import { Exhibitor, ExhibitorEdition, ExhibitorUser } from '../../../../../core/models/exhibitor.model';
import { SPExhibitor } from '../../../../../core/services/supabase/sb-exhibitor';

export interface ExhibitorFormData {
  exhibitor?: Exhibitor;
}

@Component({
  selector: 'app-exhibitor-form-modal',
  imports: [
    ReactiveFormsModule,
    DialogFrame,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './exhibitor-form-modal.html',
  styleUrl: './exhibitor-form-modal.scss',
})
export class ExhibitorFormModal implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ExhibitorFormModal>);
  private data: ExhibitorFormData = inject(MAT_DIALOG_DATA);
  private service = inject(SPExhibitor);

  get isEditMode(): boolean {
    return !!this.data?.exhibitor;
  }

  readonly users = signal<ExhibitorUser[]>([]);
  readonly editions = signal<ExhibitorEdition[]>([]);
  readonly loading = signal(true);

  form = this.fb.group({
    user_id: ['', [Validators.required]],
    edition_id: ['', [Validators.required]],
    company_name: ['', [Validators.maxLength(200)]],
    sector: ['', [Validators.maxLength(150)]],
    logo_url: ['', [Validators.maxLength(500)]],
    active: [true],
  });

  ngOnInit(): void {
    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded === 2) this.loading.set(false);
    };

    this.service.getUsers().subscribe({ next: (u) => { this.users.set(u); checkDone(); }, error: checkDone });
    this.service.getEditions().subscribe({ next: (e) => { this.editions.set(e); checkDone(); }, error: checkDone });

    if (this.data?.exhibitor) {
      const ex = this.data.exhibitor;
      this.form.patchValue({
        user_id: ex.user_id,
        edition_id: ex.edition_id,
        company_name: ex.company_name ?? '',
        sector: ex.sector ?? '',
        logo_url: ex.logo_url ?? '',
        active: ex.state === 'ACTIVE',
      });
    }
  }

  displayUser(user: ExhibitorUser): string {
    return user.name ? `${user.name} (${user.email})` : user.email;
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;
    this.dialogRef.close({
      user_id: raw.user_id!,
      edition_id: raw.edition_id!,
      company_name: raw.company_name || null,
      sector: raw.sector || null,
      logo_url: raw.logo_url || null,
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
    if (control.errors['maxlength'])
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }
}
