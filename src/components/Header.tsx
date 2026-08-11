import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutAction } from '../store/authSlice';
import { getRoleLabel } from '../utils/permissions';

export const HeaderComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <header className="app-header">
      <div>
        <div className="app-title-group">
          <h1 className="app-title">Social Media Management System</h1>
        </div>
        <p className="experiment-step-desc">
          Centralized Multi-Platform Social Media Publishing, Scheduling & Analytics
        </p>
      </div>

      {isAuthenticated && user && (
        <div className="user-profile-bar">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                User: {user.name}
              </span>
              <span className={`role-pill ${user.role}`} title={getRoleLabel(user.role)}>
                {user.role.toUpperCase()}
              </span>
            </div>
            {token && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)',
                  background: '#f1f5f9',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  maxWidth: '220px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={`Decoded JWT Role: ${user.role} | ${token}`}
              >
                JWT: {token.slice(0, 22)}...
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => dispatch(logoutAction())}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
