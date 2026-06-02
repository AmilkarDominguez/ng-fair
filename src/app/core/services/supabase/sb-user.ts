import { Injectable } from '@angular/core';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class SPUser {
  private supabase: SupabaseClient;
  private data$ = new BehaviorSubject<User[]>([]);
  private listening = false;

  private readonly TABLE_NAME = 'users';

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  public get(): Observable<User[]> {
    return from(
      this.supabase.from(this.TABLE_NAME).select('*').order('name', { ascending: true }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as User[];
      }),
    );
  }

  public add(item: User): Observable<User[]> {
    const { id, created_at, updated_at, ...payload } = item;
    return from(this.supabase.from(this.TABLE_NAME).insert([payload]).select()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    );
  }

  public update(item: User): Observable<User[]> {
    const { created_at, updated_at, ...payload } = item;
    // Exclude password from update if empty (edit without changing password)
    if (!payload.password) {
      const { password, ...withoutPassword } = payload;
      return from(
        this.supabase.from(this.TABLE_NAME).update(withoutPassword).eq('id', item.id).select(),
      ).pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('Error en Supabase:', error.message);
            throw error;
          }
          return data;
        }),
      );
    }
    return from(
      this.supabase.from(this.TABLE_NAME).update(payload).eq('id', item.id).select(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error en Supabase:', error.message);
          throw error;
        }
        return data;
      }),
    );
  }

  public delete(id: string): Observable<User[]> {
    return from(
      this.supabase.from(this.TABLE_NAME).delete().eq('id', id).select(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error en Supabase:', error.message);
          throw error;
        }
        return data;
      }),
    );
  }

  public listen(): Observable<User[]> {
    this.get().subscribe((items) => this.data$.next(items));

    if (!this.listening) {
      this.listening = true;
      this.supabase
        .channel('users-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: this.TABLE_NAME }, () => {
          this.get().subscribe((data) => this.data$.next(data));
        })
        .subscribe();
    }

    return this.data$.asObservable();
  }
}
