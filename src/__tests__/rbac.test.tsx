import { describe, it, expect } from 'vitest';
import { hasPermission } from '../utils/permissions';

describe('Role-Based Access Control (RBAC)', () => {
  it('grants full permissions to Admin role', () => {
    expect(hasPermission('admin', 'create')).toBe(true);
    expect(hasPermission('admin', 'edit')).toBe(true);
    expect(hasPermission('admin', 'publish')).toBe(true);
    expect(hasPermission('admin', 'delete')).toBe(true);
  });

  it('grants create/edit/publish to Editor role, but denies delete', () => {
    expect(hasPermission('editor', 'create')).toBe(true);
    expect(hasPermission('editor', 'edit')).toBe(true);
    expect(hasPermission('editor', 'publish')).toBe(true);
    expect(hasPermission('editor', 'delete')).toBe(false); // Delete restricted to Admin
  });

  it('denies all write/edit/delete actions to Viewer role (Read-Only)', () => {
    expect(hasPermission('viewer', 'create')).toBe(false);
    expect(hasPermission('viewer', 'edit')).toBe(false);
    expect(hasPermission('viewer', 'publish')).toBe(false);
    expect(hasPermission('viewer', 'delete')).toBe(false);
  });
});
