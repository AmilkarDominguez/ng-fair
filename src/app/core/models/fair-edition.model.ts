import { EntityState } from './user.model';

export interface FairEdition {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  state: EntityState;
  created_at?: string | Date;
  updated_at?: string | Date;
}
