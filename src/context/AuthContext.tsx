import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '../types';
import { api, getStoredToken } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, instagramHandle?: string) => Promise<void>;
  logout: () => void;
  loginAsDemo: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function initAuth() {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res && res.user) {
            setUser(res.user);
            setToken(storedToken);
            setIsGuest(false);
          } else {
            setIsGuest(true);
          }
        } catch {
          setIsGuest(true);
        }
      } else {
        // Default to demo guest experience
        setIsGuest(true);
      }
      setIsLoading(false);
    }
    initAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.login(email, password);
        setUser(res.user);
        setToken(res.token);
        setIsGuest(false);
        showToast('success', 'Welcome back!', `Signed in as @${res.user.instagramHandle || res.user.name}`);
      } catch (err: any) {
        showToast('error', 'Login Failed', err.message || 'Please check your credentials.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  const register = useCallback(
    async (name: string, email: string, password: string, instagramHandle?: string) => {
      setIsLoading(true);
      try {
        const res = await api.register(name, email, password, instagramHandle);
        setUser(res.user);
        setToken(res.token);
        setIsGuest(false);
        showToast('success', 'Account Created', `Welcome to FollowLens, ${res.user.name}!`);
      } catch (err: any) {
        showToast('error', 'Registration Failed', err.message || 'Could not create account.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  const loginAsDemo = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.login('demo@followlens.io', 'demo1234');
      setUser(res.user);
      setToken(res.token);
      setIsGuest(false);
      showToast('success', 'Demo Account Loaded', 'Logged in as @alex.creator with full sample snapshot history');
    } catch {
      // Fallback local demo state if server offline
      setUser({
        id: 'demo-user-1',
        email: 'demo@followlens.io',
        name: 'Alex Vance',
        instagramHandle: 'alex.creator',
        createdAt: new Date().toISOString(),
      });
      setIsGuest(false);
      showToast('info', 'Demo Profile Active', 'Using preloaded creator sample data');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setToken(null);
    setIsGuest(true);
    showToast('info', 'Logged Out', 'You are now viewing in guest mode.');
  }, [showToast]);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        login,
        register,
        logout,
        loginAsDemo,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
