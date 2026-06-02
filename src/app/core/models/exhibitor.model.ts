import { EntityState } from './user.model';

export interface ExhibitorUser {
  id: string;
  name: string | null;
  email: string;
}

export interface ExhibitorEdition {
  id: string;
  name: string;
}

export interface Exhibitor {
  id: string;
  user_id: string;
  edition_id: string;
  company_name: string | null;
  sector: string | null;
  logo_url: string | null;
  state: EntityState;
  created_at?: string | Date;
  updated_at?: string | Date;
  // Resolved via Supabase JOIN
  user?: ExhibitorUser | null;
  edition?: ExhibitorEdition | null;
}
