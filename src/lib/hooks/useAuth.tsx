import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  verify2FA: (code: string) => Promise<boolean>;
  logout: () => void;
  needs2FA: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needs2FA, setNeeds2FA] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const validRoles: Array<User['role']> = ['expert', 'manager', 'admin', 'client'];

        const isValidUser =
          parsedUser &&
          typeof parsedUser === 'object' &&
          typeof parsedUser.id === 'string' &&
          typeof parsedUser.username === 'string' &&
          typeof parsedUser.email === 'string' &&
          typeof parsedUser.name === 'string' &&
          typeof parsedUser.role === 'string' &&
          validRoles.includes(parsedUser.role);

        if (isValidUser) {
          console.log('[Auth] Restored user from localStorage:', parsedUser.username);
          setUser(parsedUser as User);
        } else {
          console.warn('[Auth] Ignoring invalid stored user in localStorage; clearing it:', parsedUser);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('[Auth] Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('[Auth] login called with:', { username });

      const response = await authApi.login({ username, password });
      console.log('[Auth] login response:', response.user.username, response.user.role);

      if (response.user.has2FA) {
        console.log('[Auth] User requires 2FA');
        setNeeds2FA(true);
        sessionStorage.setItem('pendingUser', JSON.stringify(response.user));
        sessionStorage.setItem('pendingToken', response.accessToken);
        return true;
      }

      console.log('[Auth] User logged in without 2FA');
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.accessToken);
      setNeeds2FA(false);
      return true;
    } catch (error) {
      console.error('[Auth] Login error in useAuth:', error);
      throw error;
    }
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      console.log('[Auth] Verifying 2FA code:', code);
      await authApi.verify2FA(code);

      const pendingUser = sessionStorage.getItem('pendingUser');
      const pendingToken = sessionStorage.getItem('pendingToken');

      if (pendingUser && pendingToken) {
        const restoredUser: User = JSON.parse(pendingUser);
        console.log('[Auth] 2FA verified, logging in user:', restoredUser.username);

        setUser(restoredUser);
        localStorage.setItem('user', JSON.stringify(restoredUser));
        localStorage.setItem('token', pendingToken);
        sessionStorage.removeItem('pendingUser');
        sessionStorage.removeItem('pendingToken');
        setNeeds2FA(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Auth] 2FA verification error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('[Auth] Logging out user');
    authApi.logout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('pendingUser');
    sessionStorage.removeItem('pendingToken');
    setNeeds2FA(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verify2FA,
        logout,
        needs2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

