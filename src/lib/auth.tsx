'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, refreshAccessToken, setAccessToken } from './api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
}

type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface AuthContextValue {
  user: AdminUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** True for super-admins, or when the role grants `resource:action`. */
  can: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface MeResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: { name: string; permissions: string[] };
}

function fromMe(me: MeResponse): AdminUser {
  return {
    id: me._id,
    name: me.name,
    email: me.email,
    avatar: me.avatar,
    role: me.role?.name ?? '',
    permissions: me.role?.permissions ?? [],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // On first load, try to resume the session from the refresh cookie.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await refreshAccessToken();
      if (!token) {
        if (!cancelled) setStatus('guest');
        return;
      }
      try {
        const me = await api<MeResponse>('/users/me');
        if (!cancelled) {
          setUser(fromMe(me));
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) setStatus('guest');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ accessToken: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setAccessToken(data.accessToken);
    setUser({ ...data.user, role: data.user.role ?? '', permissions: data.user.permissions ?? [] });
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Even if the API call fails, drop the local session.
    }
    setAccessToken(null);
    setUser(null);
    setStatus('guest');
  }, []);

  const can = useCallback<AuthContextValue['can']>(
    (resource, action) => !!user && (user.role === 'super-admin' || user.permissions.includes(`${resource}:${action}`)),
    [user],
  );

  return <AuthContext.Provider value={{ user, status, login, logout, can }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
