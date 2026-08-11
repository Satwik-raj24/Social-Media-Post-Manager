export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type PermissionAction = 'create' | 'edit' | 'delete' | 'publish';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  admin: ['create', 'edit', 'delete', 'publish'],
  editor: ['create', 'edit', 'publish'],
  viewer: [],
};
