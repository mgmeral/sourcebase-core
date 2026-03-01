import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from './AuthContext';

export function RequireAdmin({ children }: { children: ReactElement }) {
  const { currentUser } = useAuth();
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <Navigate to="/routes" replace />;
  }
  return children;
}
