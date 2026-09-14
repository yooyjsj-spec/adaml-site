import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { logout as apiLogout } from '../api/admin';
import { refreshAuth } from '../api/client';
import { AdminUserDto } from '../types';
import { AdminOtpSetupModal } from '../pages/admin/AdminOtpSetup';

interface AdminAuthValue {
  ready: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isLoggedIn: boolean;
  requiresTotpSetup: boolean;
  user?: AdminUserDto;
  signOut: () => Promise<void>;
  refresh: () => Promise<AdminUserDto | undefined>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export const useAdminAuth = () => {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return value;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AdminUserDto | undefined>();
  const [requiresTotpSetup, setRequiresTotpSetup] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const auth = await refreshAuth();
      setUser(auth.user);
      setRequiresTotpSetup(Boolean(auth.requiresTotpSetup));
      return auth.user;
    } catch {
      setUser(undefined);
      setRequiresTotpSetup(false);
      return undefined;
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Session may already be gone.
    }
    setUser(undefined);
    setRequiresTotpSetup(false);
  }, []);

  const value = useMemo<AdminAuthValue>(
    () => ({
      ready,
      isAdmin: Boolean(user?.totpEnabled),
      isStaff: user?.role === 'STAFF' || Boolean(user?.totpEnabled),
      isLoggedIn: Boolean(user),
      requiresTotpSetup,
      user,
      signOut,
      refresh,
    }),
    [ready, user, requiresTotpSetup, signOut, refresh]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
      <AdminOtpSetupModal open={requiresTotpSetup} onComplete={refresh} />
    </AdminAuthContext.Provider>
  );
};
