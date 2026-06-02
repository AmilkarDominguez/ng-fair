import { Injectable } from '@angular/core';
import { from, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Exhibitor, ExhibitorEdition, ExhibitorUser } from '../../models/exhibitor.model';

@Injectable({ providedIn: 'root' })
export class SPExhibitor {
  private supabase: SupabaseClient;
  private data$ = new BehaviorSubject<Exhibitor[]>([]);
  private listening = false;

  private readonly TABLE_NAME = 'exhibitors';

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  public get(): Observable<Exhibitor[]> {
    return from(
      this.supabase
        .from(this.TABLE_NAME)
        .select('*, user:users(id, name, email), edition:fair_editions(id, name)')
        .order('created_at', { ascending: false }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as Exhibitor[];
      }),
    );
  }

  public add(item: Exhibitor): Observable<Exhibitor[]> {
    const { id, created_at, updated_at, user, edition, ...payload } = item;
    return from(this.supabase.from(this.TABLE_NAME).insert([payload]).select()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    );
  }

  public update(item: Exhibitor): Observable<Exhibitor[]> {
    const { created_at, updated_at, user, edition, ...payload } = item;
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

  public delete(id: string): Observable<Exhibitor[]> {
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

  public listen(): Observable<Exhibitor[]> {
    this.get().subscribe((items) => this.data$.next(items));

    if (!this.listening) {
      this.listening = true;
      this.supabase
        .channel('exhibitors-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: this.TABLE_NAME }, () => {
          this.get().subscribe((data) => this.data$.next(data));
        })
        .subscribe();
    }

    return this.data$.asObservable();
  }

  public getUsers(): Observable<ExhibitorUser[]> {
    return from(
      this.supabase.from('users').select('id, name, email').order('name', { ascending: true }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as ExhibitorUser[];
      }),
    );
  }

  public getEditions(): Observable<ExhibitorEdition[]> {
    return from(
      this.supabase
        .from('fair_editions')
        .select('id, name')
        .eq('state', 'ACTIVE')
        .order('name', { ascending: true }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as ExhibitorEdition[];
      }),
    );
  }
}
