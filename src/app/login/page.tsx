'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getAuthorizedEmail } from '@/lib/authSecurity';
import { ShieldCheck, ShieldAlert, LogIn, Sparkles, Lock } from 'lucide-react';
import LiquidBackground from '@/components/LiquidBackground';
import Floating3DChicken from '@/components/Floating3DChicken';
import TiltCard from '@/components/TiltCard';

export default function LoginPage() {
  const router = useRouter();
  const { authState, loginWithGoogle, unauthorizedEmail, error: authError } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (authState === 'AUTHENTICATED') {
      router.replace('/dashboard');
    }
  }, [authState, router]);

  const handleGoogleClick = async () => {
    setLocalError(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setLocalError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // State 1: Loading
  if (authState === 'LOADING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
        <LiquidBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <Floating3DChicken size={84} />
          <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
            Chicken Farm Pro
          </h2>
          <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">
            Restoring your farm session...
          </p>
        </div>
      </div>
    );
  }

  // State 2: Unauthorized Account (Access Restricted)
  if (authState === 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
        <LiquidBackground />

        <div className="w-full max-w-md relative z-10 animate-fadeIn">
          <div className="text-center mb-6 flex flex-col items-center">
            <Floating3DChicken size={84} />
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-2">
              Chicken Farm Pro
            </h1>
          </div>

          <TiltCard maxTilt={5} glare={true}>
            <div className="p-6 sm:p-8 rounded-3xl border border-red-500/30 bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-red-400">
                  Access Restricted
                </h2>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  The Google account <strong className="text-[var(--text-primary)]">{unauthorizedEmail || 'used'}</strong> is not authorized to access Chicken Farm Pro.
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Only <span className="text-emerald-400 font-semibold">{getAuthorizedEmail()}</span> is granted access.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-75"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with another Google account'}</span>
                </button>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    );
  }

  const displayError = localError || authError;

  // State 3: Normal Unauthenticated Login Screen
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <LiquidBackground />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-2">
            <Floating3DChicken size={84} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Chicken Farm Pro
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
            Smart Precision Poultry OS • Cloud Database
          </p>
        </div>

        {/* Real Firebase Google Auth Card */}
        <TiltCard maxTilt={5} glare={true}>
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl backdrop-blur-xl space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Sign In to Your Farm
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Connect with your authorized Google account to manage your flocks &amp; records
              </p>
            </div>

            {/* Google One-Click Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={googleLoading}
                className="w-full py-4 px-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] font-bold text-sm text-[var(--text-primary)] flex items-center justify-center gap-3.5 transition-all duration-200 shadow-lg hover:border-emerald-500/50 hover:shadow-emerald-500/10 active:scale-[0.98] cursor-pointer disabled:opacity-75"
              >
                {googleLoading ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                    <span className="text-xs text-[var(--text-secondary)]">Connecting to Google...</span>
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

            {/* Error Message */}
            {displayError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{displayError}</span>
              </div>
            )}

            {/* Security Guarantee */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Authorized Google Account Access • Firebase Security</span>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
