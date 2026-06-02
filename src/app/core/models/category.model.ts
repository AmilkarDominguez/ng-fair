import { EntityState } from './user.model';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  state: EntityState;
  created_at?: string | Date;
  updated_at?: string | Date;
}
