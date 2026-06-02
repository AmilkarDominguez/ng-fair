import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../../models/user.model';

const MOCK_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Admin Sistema',
    email: 'admin@fairsys.com',
    password: '••••••',
    role: 'ADMIN',
    state: 'ACTIVE',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'usr-002',
    name: 'Tecno Innovar',
    email: 'contacto@tecnoinnovar.com',
    password: '••••••',
    role: 'EXHIBITOR',
    state: 'ACTIVE',
    created_at: '2025-02-01T09:30:00Z',
    updated_at: '2025-02-01T09:30:00Z',
  },
  {
    id: 'usr-003',
    name: 'Agro Bolivia',
    email: 'info@agrobolivia.bo',
    password: '••••••',
    role: 'EXHIBITOR',
    state: 'ACTIVE',
    created_at: '2025-02-05T10:00:00Z',
    updated_at: '2025-02-05T10:00:00Z',
  },
  {
    id: 'usr-004',
    name: 'Carlos Mamani',
    email: 'cmamani@gmail.com',
    password: '••••••',
    role: 'VISITOR',
    state: 'ACTIVE',
    created_at: '2025-03-01T11:00:00Z',
    updated_at: '2025-03-01T11:00:00Z',
  },
  {
    id: 'usr-005',
    name: 'Laura Quispe',
    email: 'lquispe@email.com',
    password: '••••••',
    role: 'VISITOR',
    state: 'INACTIVE',
    created_at: '2025-03-10T14:00:00Z',
    updated_at: '2025-03-10T14:00:00Z',
  },
  {
    id: 'usr-006',
    name: 'EcoTech SRL',
    email: 'ventas@ecotech.com',
    password: '••••••',
    role: 'EXHIBITOR',
    state: 'ACTIVE',
    created_at: '2025-04-01T08:00:00Z',
    updated_at: '2025-04-01T08:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class SPUser {
  private data$ = new BehaviorSubject<User[]>(MOCK_USERS);

  listen(): Observable<User[]> {
    return this.data$.asObservable();
  }

  add(item: User): Observable<void> {
    const next = [...this.data$.value, { ...item, id: crypto.randomUUID() }];
    this.data$.next(next);
    return of(undefined);
  }

  update(item: User): Observable<void> {
    const next = this.data$.value.map((u) => (u.id === item.id ? item : u));
    this.data$.next(next);
    return of(undefined);
  }

  delete(id: string): Observable<void> {
    const next = this.data$.value.filter((u) => u.id !== id);
    this.data$.next(next);
    return of(undefined);
  }
}
