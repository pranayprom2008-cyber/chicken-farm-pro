'use client';

import React, { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useFarmStore } from '@/store/useFarmStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUserFromSupabase, syncAll } = useFarmStore();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Check existing session on launch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserFromSupabase(session.user);
        syncAll();
      }
    });

    // 2. Listen to active auth state changes across tabs/devices
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserFromSupabase(session.user);
        await syncAll();
      } else if (event === 'SIGNED_OUT') {
        setUserFromSupabase(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUserFromSupabase, syncAll]);

  return <>{children}</>;
}
