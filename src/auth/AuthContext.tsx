import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Role, User } from '../types';
import { setUnauthorizedHandler } from '../api/fetcher';

interface AuthContextValue {
  currentUser: User | null;
  login: (role: Role) => void;
  logout: () => void;
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (role: Role) => {
    setCurrentUser({ name: 'Authenticated User', role });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const setRole = (role: Role) => {
    setCurrentUser((previous) => (previous ? { ...previous, role } : previous));
  };

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
      setRole
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
