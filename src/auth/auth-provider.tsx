import type { Session } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/lib/supabase';

export type Profile = {
  fullName: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  smsConsentAt: string | null;
};

type AuthContextValue = {
  /** False until the saved sign-in (if any) has been checked. */
  ready: boolean;
  session: Session | null;
  /** Null when signed out, or briefly while it loads after signing in. */
  profile: Profile | null;
  isAdmin: boolean;
  /** Re-reads the profile, e.g. after the customer saves their name. */
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone, role, sms_consent_at')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return {
    fullName: data.full_name,
    phone: data.phone,
    role: data.role === 'admin' ? 'admin' : 'customer',
    smsConsentAt: data.sms_consent_at,
  };
}

/**
 * Who is signed in, and their profile. Signing in itself happens on the sign-in
 * screen; this follows the result. Being an admin here only decides what the app
 * shows: the database's row-level security is what actually protects admin data.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  // Tagged with its user, so a profile loaded before a sign-out or account switch is ignored.
  const [loaded, setLoaded] = useState<{ userId: string; profile: Profile | null } | null>(null);
  const userId = session?.user.id ?? null;
  const profile = loaded && loaded.userId === userId ? loaded.profile : null;

  useEffect(() => {
    // Fires once with the saved session (INITIAL_SESSION), then on every sign-in,
    // sign-out, and token refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    // Kept out of the auth callback above: awaiting Supabase calls inside it can deadlock.
    fetchProfile(userId).then((next) => setLoaded({ userId, profile: next }));
  }, [userId]);

  return (
    <AuthContext
      value={{
        ready,
        session,
        profile,
        isAdmin: profile?.role === 'admin',
        refreshProfile: async () => {
          if (userId) setLoaded({ userId, profile: await fetchProfile(userId) });
        },
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
