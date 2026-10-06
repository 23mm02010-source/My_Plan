import React, { useState } from 'react';
import {
  Code2,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Database,
  Smartphone,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CloudDatabaseModal } from './CloudDatabaseModal';

export const AuthModal: React.FC = () => {
  const { login, register, isCloudConnected, cloudStatus } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setError('Passwords do not match. Please re-enter confirm password.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(cleanEmail, cleanPassword);
        if (!res.success) {
          setError(res.error || 'Failed to sign in. Please check your credentials.');
        }
      } else {
        const res = await register(name.trim(), cleanEmail, cleanPassword);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-card border border-card-border rounded-3xl shadow-2xl overflow-hidden glow-card">
          {/* Header Branding */}
          <div className="p-6 sm:p-7 text-center border-b border-card-border/80 bg-surface-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 mb-3">
                <Code2 className="w-6 h-6 stroke-[2.5]" />
              </div>

              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Planly <span className="text-primary-400">DSA</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                Personal SDE Preparation Roadmap. Sign in to continue your exact progress on any device.
              </p>
            </div>
          </div>

          {/* Cloud Database Sync Status Pill */}
          <div className="px-6 py-2.5 bg-slate-900/80 border-b border-card-border/60 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              {isCloudConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-medium">Cloud Database Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400 font-medium">Local Mode (No cloud DB)</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsDbModalOpen(true)}
              className="text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Database className="w-3 h-3" />
              <span>{isCloudConnected ? 'DB Info' : 'Connect Cloud DB'}</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Mode Switcher */}
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Your Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Shaik Roshan"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Email Address (Unique Username)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. roshan@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter password'}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-primary-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{mode === 'login' ? 'Sign In to Your Roadmap' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Cross Device Notice */}
            <div className="pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
              <span className="flex items-center justify-center gap-1.5 text-slate-400">
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>Works on mobile and desktop</span>
                <Laptop className="w-3 h-3 text-primary-400 ml-1" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <CloudDatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </>
  );
};
