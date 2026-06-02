export type EntityState = 'ACTIVE' | 'INACTIVE';
export type UserRole = 'ADMIN' | 'EXHIBITOR' | 'VISITOR';

export interface User {
  id: string;
  name: string | null;
  email: string;
  password: string;
  role: UserRole;
  state: EntityState;
  created_at?: string | Date;
  updated_at?: string | Date;
}
