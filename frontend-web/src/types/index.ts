export type UserRole = 'USER' | 'MASTER' | 'ADMIN';

export interface User {
  id: string;
  name?: string;
  phone: string;
  role: UserRole;
  avatar?: string | null;
}
