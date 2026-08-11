import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateUserRole, addUser, deleteUser } from '../store/authSlice';
import { UserRole } from '../types/auth';

export const UserManagementComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const usersList = useAppSelector((state) => state.auth.usersList);

  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('editor');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return null;
  }

  const handleRoleChange = (userId: string, role: UserRole) => {
    dispatch(updateUserRole({ userId, newRole: role }));
    setMsg(`Role updated to ${role.toUpperCase()} for user.`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    dispatch(
      addUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
      })
    );

    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
    setMsg(`New user ${newEmail} created successfully.`);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own active Admin account.');
      return;
    }
    dispatch(deleteUser(userId));
    setMsg(`User ${name} removed from system.`);
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #ef4444' }}>
      <div className="card-title" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <span>Admin User Management Panel</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Close Form' : 'Add New User'}
        </button>
      </div>

      {msg && (
        <div className="toast-banner success" style={{ padding: '8px 12px', fontSize: '0.82rem', marginBottom: '12px' }}>
          {msg}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddUserSubmit} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>Create System Account</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <input
              type="text"
              placeholder="Full Name"
              className="url-input"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="url-input"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <select
              className="url-input"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
            >
              <option value="admin">Admin (Full Control)</option>
              <option value="editor">Editor (Create / Edit)</option>
              <option value="viewer">Viewer (Read-Only)</option>
            </select>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              Register User
            </button>
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '8px 12px' }}>User Name</th>
              <th style={{ padding: '8px 12px' }}>Email</th>
              <th style={{ padding: '8px 12px' }}>Assigned Role</th>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                  {u.name} {u.id === currentUser.id ? '(You)' : ''}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '10px 12px' }}>
                  <select
                    className="url-input"
                    style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  {u.id !== currentUser.id && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(u.id, u.name)}
                    >
                      Delete User
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const UserManagement = React.memo(UserManagementComponent);
