import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
    MatAutocompleteModule,
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

  // Separate control for the autocomplete input (stores object or typed string)
  readonly userSearch = new FormControl<ExhibitorUser | string>('');

  private readonly _allUsers = signal<ExhibitorUser[]>([]);
  readonly editions = signal<ExhibitorEdition[]>([]);
  readonly loading = signal(true);

  private readonly userSearchValue = toSignal(
    this.userSearch.valueChanges.pipe(startWith('')),
    { initialValue: '' as ExhibitorUser | string },
  );

  readonly filteredUsers = computed(() => {
    const val = this.userSearchValue();
    const term = typeof val === 'string' ? val.toLowerCase().trim() : '';
    if (!term) return this._allUsers();
    return this._allUsers().filter(
      (u) =>
        (u.name ?? '').toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  });

  form = this.fb.group({
    user_id: ['', [Validators.required]],
    edition_id: ['', [Validators.required]],
    company_name: ['', [Validators.maxLength(200)]],
    sector: ['', [Validators.maxLength(150)]],
    logo_url: ['', [Validators.maxLength(500)]],
    active: [true],
  });

  ngOnInit(): void {
    // Clear user_id whenever the user types (not selects from dropdown)
    this.userSearch.valueChanges.subscribe((val) => {
      if (typeof val === 'string') {
        this.form.get('user_id')!.setValue('');
      }
    });

    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded === 2) this.loading.set(false);
    };

    this.service.getUsers().subscribe({
      next: (users) => {
        this._allUsers.set(users);
        // In edit mode, try to pre-select the user once the list is loaded
        if (this.data?.exhibitor?.user) {
          this.userSearch.setValue(this.data.exhibitor.user, { emitEvent: false });
        }
        checkDone();
      },
      error: checkDone,
    });

    this.service.getEditions().subscribe({
      next: (e) => { this.editions.set(e); checkDone(); },
      error: checkDone,
    });

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

  displayUser = (value: ExhibitorUser | string | null): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.name || value.email;
  };

  onUserSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as ExhibitorUser;
    this.form.get('user_id')!.setValue(user.id);
    this.form.get('user_id')!.markAsTouched();
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
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
