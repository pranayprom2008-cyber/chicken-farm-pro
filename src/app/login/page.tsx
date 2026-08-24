'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  Lock,
  CircleDot
} from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import Floating3DChicken from '@/components/Floating3DChicken';
import TiltCard from '@/components/TiltCard';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPhone, isAuthenticated, theme, setTheme } = useFarmStore();

  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  // Real Google OAuth through Supabase Auth
  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Graceful local development notice if env vars are pending
      setError('Supabase credentials pending in environment. You can also use authorized Admin access below.');
      setGoogleLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google Login');
      setGoogleLoading(false);
    }
  };

  const handlePhoneLogin = async (e?: React.FormEvent, directNumber?: string) => {
    if (e) e.preventDefault();
    setError('');

    const targetPhone = directNumber || phone;
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');

    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    const result = await loginWithPhone(cleanPhone);
    setLoading(false);

    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Access Denied. Only authorized numbers permitted.');
    }
  };

  const isLiquid = theme === 'obsidian' || theme === 'liquid-glass' || theme === 'liquid';

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <LiquidBackground />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Brand Header with 3D Holographic Chicken */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-2">
            <Floating3DChicken size={90} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            ChickFarm Pro
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Enterprise Cloud Poultry Management OS
          </p>
        </div>

        {/* Login Card */}
        <TiltCard maxTilt={6} glare={true}>
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl space-y-6">
            
            {/* Google OAuth Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full py-3.5 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] font-bold text-sm text-[var(--text-primary)] flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:border-emerald-500/50 active:scale-[0.98]"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border-color)]" />
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                or admin phone
              </span>
              <div className="flex-1 h-px bg-[var(--border-color)]" />
            </div>

            {/* Phone Authentication Form */}
            <form onSubmit={(e) => handlePhoneLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Authorized Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">+91</span>
                    <div className="w-px h-4 bg-[var(--border-color)]" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    className="w-full pl-16 pr-4 py-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Quick Login Chips */}
              <div>
                <span className="text-[11px] text-[var(--text-muted)] block mb-1.5">
                  Quick Select Admins:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPhone('9502828293');
                      handlePhoneLogin(undefined, '9502828293');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      isLiquid
                        ? 'bg-white/[0.03] border-white/10 hover:border-cyan-400 text-cyan-300'
                        : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-emerald-500 text-[var(--text-primary)]'
                    }`}
                  >
                    John (Owner)
                    <span className="block text-[10px] text-[var(--text-muted)] font-normal">9502828293</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhone('9849852085');
                      handlePhoneLogin(undefined, '9849852085');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      isLiquid
                        ? 'bg-white/[0.03] border-white/10 hover:border-cyan-400 text-cyan-300'
                        : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-emerald-500 text-[var(--text-primary)]'
                    }`}
                  >
                    Pranay (Manager/Tech)
                    <span className="block text-[10px] text-[var(--text-muted)] font-normal">9849852085</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                  isLiquid
                    ? 'bg-gradient-to-r from-violet-600 via-cyan-600 to-emerald-500 hover:opacity-90 shadow-lg shadow-violet-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                } ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <span>Sign In to ChickFarm</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
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
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? t.id === 'light'
                        ? 'bg-amber-100 text-amber-800'
                        : t.id === 'dark'
                        ? 'bg-emerald-900/60 text-emerald-400'
                        : t.id === 'bubble'
                        ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-200 border border-cyan-400/50'
                        : 'bg-cyan-500/20 text-cyan-300'
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
          © 2026 ChickFarm Pro • High-Precision Commercial Poultry Management
        </p>
      </div>
    </div>
  );
}
