import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { currentUser, setRole, login, logout } = useAuth();
  const [loginRole, setLoginRole] = useState<Role>('USER');

  return (
    <header className="header">
      <div className="header-left">
        <button className="hamburger" onClick={onOpenMobileMenu} aria-label="Open menu">
          ☰
        </button>
        <span className="brand">HEADER</span>
      </div>
      <div className="header-right">
        {!currentUser ? (
          <>
            <label htmlFor="login-role" className="role-label">
              Login role:
            </label>
            <select
              id="login-role"
              className="role-select"
              value={loginRole}
              onChange={(event) => setLoginRole(event.target.value as Role)}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
            <button className="btn small" onClick={() => login(loginRole)}>
              Login
            </button>
          </>
        ) : (
          <>
            <label htmlFor="role-toggle" className="role-label">
              Role:
            </label>
            <select
              id="role-toggle"
              className="role-select"
              value={currentUser.role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
            <span className="role-badge">Current: {currentUser.role}</span>
            <button className="btn ghost small" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}
