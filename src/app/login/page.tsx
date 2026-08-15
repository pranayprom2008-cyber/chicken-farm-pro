'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFarmStore } from '@/store/useFarmStore';
import { Phone, Mail, Lock, Eye, EyeOff, Bird, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithPhone, isAuthenticated, theme, setTheme } = useFarmStore();
  const [mounted, setMounted] = useState(false);
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme on mount
    const savedTheme = useFarmStore.getState().theme;
    if (savedTheme) {
      document.documentElement.classList.remove('dark', 'obsidian');
      if (savedTheme !== 'light') document.documentElement.classList.add(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthenticated, router]);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = loginWithPhone(cleanPhone);
    setLoading(false);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const success = login(email, password);
    setLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const isObsidian = theme === 'obsidian';

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Aurora background for obsidian theme */}
      {isObsidian && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20 animate-aurora-1"
            style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)', filter: 'blur(120px)' }} />
          <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-15 animate-aurora-2"
            style={{ background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)', filter: 'blur(120px)' }} />
          <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full opacity-10 animate-aurora-3"
            style={{ background: 'radial-gradient(circle, #A3FFCB 0%, transparent 70%)', filter: 'blur(120px)' }} />
        </div>
      )}

      <div className={`w-full max-w-md relative z-10 ${isObsidian ? 'animate-float-up' : ''}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isObsidian ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
          }`}>
            <Bird className={`w-8 h-8 ${isObsidian ? 'text-violet-400' : 'text-emerald-500'}`} />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight text-[var(--text-primary)] ${isObsidian ? 'font-[Space_Grotesk]' : ''}`}>
            ChickFarm Pro
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Premium Chicken Farm Management</p>
        </div>

        {/* Login Card */}
        <div className={`rounded-2xl border p-6 ${
          isObsidian
            ? 'obsidian-glass'
            : 'bg-[var(--bg-card)] border-[var(--border-color)] shadow-lg'
        }`}>
          {/* Mode Toggle */}
          <div className={`flex rounded-xl p-1 mb-6 ${
            isObsidian ? 'bg-white/[0.04]' : 'bg-[var(--bg-secondary)]'
          }`}>
            <button
              onClick={() => { setLoginMode('phone'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginMode === 'phone'
                  ? isObsidian ? 'bg-violet-500/20 text-violet-300' : 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
            <button
              onClick={() => { setLoginMode('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                loginMode === 'email'
                  ? isObsidian ? 'bg-violet-500/20 text-violet-300' : 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>

          {/* Phone Login */}
          {loginMode === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-sm text-[var(--text-muted)]">+91</span>
                    <div className="w-px h-4 bg-[var(--border-color)]" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter your phone number"
                    maxLength={10}
                    className={`w-full pl-16 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                      isObsidian
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-500 focus:border-violet-500/50'
                        : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-gray-400 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
                isObsidian ? 'bg-violet-500/5 text-violet-300/70 border border-violet-500/10' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Your data is stored securely by phone number. Each number has its own separate farm data.</span>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  isObsidian
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    Continue with Phone
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Email Login */}
          {loginMode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@chickfarm.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                      isObsidian
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-500 focus:border-violet-500/50'
                        : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-gray-400 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all duration-200 ${
                      isObsidian
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-500 focus:border-violet-500/50'
                        : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-primary)] placeholder-gray-400 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className={`text-xs p-3 rounded-xl ${
                isObsidian ? 'bg-white/[0.03] text-[var(--text-muted)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              }`}>
                Demo: admin@chickfarm.com / admin123
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  isObsidian
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center justify-center mt-6 gap-2">
          <span className="text-xs text-[var(--text-muted)]">Theme:</span>
          <div className={`flex rounded-lg p-0.5 ${
            isObsidian ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-[var(--bg-secondary)]'
          }`}>
            {(['light', 'dark', 'obsidian'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  theme === t
                    ? t === 'light' ? 'bg-white text-amber-600 shadow-sm'
                    : t === 'dark' ? 'bg-emerald-900/50 text-emerald-400'
                    : 'bg-violet-500/20 text-violet-300'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '✦'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
          © 2026 ChickFarm Pro. Built with precision.
        </p>
      </div>
    </div>
  );
}
