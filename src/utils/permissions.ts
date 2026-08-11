import { UserRole, PermissionAction, ROLE_PERMISSIONS } from '../types/auth';

export const hasPermission = (
  role: UserRole | undefined,
  action: PermissionAction
): boolean => {
  if (!role) return false;
  const allowedActions = ROLE_PERMISSIONS[role] || [];
  return allowedActions.includes(action);
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Admin (Full Control)';
    case 'editor':
      return 'Editor (Create & Edit)';
    case 'viewer':
      return 'Viewer (Read Only)';
    default:
      return role;
  }
};
