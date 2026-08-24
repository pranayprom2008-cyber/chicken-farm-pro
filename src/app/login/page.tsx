'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Sparkles, Sun, Moon, CircleDot, ShieldCheck } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import Floating3DChicken from '@/components/Floating3DChicken';
import TiltCard from '@/components/TiltCard';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, theme, setTheme } = useFarmStore();

  const [checkingSession, setCheckingSession] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Initial Session Check: If already authenticated via Supabase session, redirect straight to dashboard
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          router.replace('/dashboard');
        } else {
          setCheckingSession(false);
        }
      }).catch(() => {
        setCheckingSession(false);
      });
    } else {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        setCheckingSession(false);
      }
    }
  }, [isAuthenticated, router]);

  // Real Google OAuth through Supabase Auth
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase project configuration is required to initiate Google OAuth. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setGoogleLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('cancel') || error.message.includes('closed')) {
          setError('Google sign-in was cancelled.');
        } else {
          setError(`Google sign-in failed: ${error.message}`);
        }
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  // Full-screen clean loading state during initial session verification
  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
        <LiquidBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
            Verifying Secure Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <LiquidBackground />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3">
            <Floating3DChicken size={90} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            ChickFarm Pro
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 font-medium">
            Smart Commercial Poultry Precision OS
          </p>
        </div>

        {/* Pure Google OAuth Sign-in Card */}
        <TiltCard maxTilt={6} glare={true}>
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                Sign in to your Farm
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Access your real-time flock biometrics, ledgers, and AI advisory
              </p>
            </div>

            {/* Google Continue Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-4 px-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] font-bold text-sm text-[var(--text-primary)] flex items-center justify-center gap-3.5 transition-all duration-200 shadow-md hover:border-emerald-500/50 hover:shadow-emerald-500/10 active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                    <span className="text-xs text-[var(--text-secondary)] font-semibold">Connecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Security Guarantee Badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Multi-Tenant Row Level Security (RLS) Enforced</span>
            </div>
          </div>
        </TiltCard>

        {/* Theme Switcher on Login */}
        <div className="flex items-center justify-center mt-6 gap-2">
          <span className="text-xs text-[var(--text-muted)]">Theme:</span>
          <div className="flex rounded-xl p-1 bg-[var(--bg-card)] border border-[var(--border-color)]">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'liquid', label: 'Liquid', icon: Sparkles },
              { id: 'bubble', label: 'Bubble', icon: CircleDot },
            ].map((t) => {
              const Icon = t.icon;
              const isActive =
                theme === t.id ||
                (t.id === 'liquid' && (theme === 'obsidian' || theme === 'liquid-glass'));
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? t.id === 'light'
                        ? 'bg-amber-100 text-amber-800 font-bold'
                        : t.id === 'dark'
                        ? 'bg-emerald-900/60 text-emerald-400 font-bold'
                        : t.id === 'bubble'
                        ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-200 border border-cyan-400/50 font-bold'
                        : 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--text-muted)] mt-4">
          Secure authentication powered by Google & Supabase
        </p>
      </div>
    </div>
  );
}
