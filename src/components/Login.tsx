import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginThunk, clearAuthError } from '../store/authSlice';
import { UserRole } from '../types/auth';

interface RoleOption {
  role: UserRole;
  title: string;
  email: string;
  description: string;
  badgeColor: string;
}

const DEMO_ROLES: RoleOption[] = [
  {
    role: 'admin',
    title: 'Admin',
    email: 'admin@gmail.com',
    description: 'Full control: Create, Edit, Delete posts, & Manage Users',
    badgeColor: '#ef4444',
  },
  {
    role: 'editor',
    title: 'Editor',
    email: 'editor@gmail.com',
    description: 'Content creator: Create, Edit, Schedule & Publish posts',
    badgeColor: '#3b82f6',
  },
  {
    role: 'viewer',
    title: 'Viewer',
    email: 'viewer@gmail.com',
    description: 'Read-only access: View feeds, analytics & calendar',
    badgeColor: '#6b7280',
  },
];

export const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState<string>('admin@gmail.com');
  const [password, setPassword] = useState<string>('password123');
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSelectRole = (option: RoleOption) => {
    dispatch(clearAuthError());
    setActiveRole(option.role);
    setEmail(option.email);
    setPassword('password123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginThunk({ email, password }));
  };

  const selectedRoleOption = DEMO_ROLES.find((r) => r.role === activeRole) || DEMO_ROLES[0];

  return (
    <div className="login-wrapper">
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />

      <div className="glass-login-card">
        <div className="login-brand-header">
          <h2 className="brand-title">Social Media Hub</h2>
          <p className="brand-subtitle">
            Sign in to access your social media workspace & analytics
          </p>
        </div>

        <div className="role-selector-label">
          <span>Select Account Demo Role</span>
        </div>

        <div className="role-grid">
          {DEMO_ROLES.map((option) => {
            const isSelected = activeRole === option.role || email === option.email;
            return (
              <div
                key={option.role}
                className={`role-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectRole(option)}
              >
                <span className="role-name">{option.title}</span>
              </div>
            );
          })}
        </div>

        <div className="role-scope-banner">
          <span className="scope-title" style={{ color: selectedRoleOption.badgeColor }}>
            {selectedRoleOption.title} Account Active
          </span>
          <span className="scope-desc">{selectedRoleOption.description}</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-field-group">
            <label htmlFor="login-email" className="input-label">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="custom-input"
              style={{ paddingLeft: '12px' }}
              required
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => {
                dispatch(clearAuthError());
                setEmail(e.target.value);
              }}
            />
          </div>

          <div className="input-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password" className="input-label">
                Password
              </label>
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="custom-input"
              style={{ paddingLeft: '12px' }}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                dispatch(clearAuthError());
                setPassword(e.target.value);
              }}
            />
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          <button
            type="submit"
            className="submit-login-btn"
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? (
              <span>Authenticating JWT Token...</span>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="login-footer-hint">
          <span>Default password for all demo accounts: <code>password123</code></span>
        </div>
      </div>
    </div>
  );
};
