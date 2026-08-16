import React, { useState } from 'react';
import { Bot, Sparkles, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemo } = useAuth();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        await signUpWithEmail(email.trim(), password, name.trim());
      } else {
        await signInWithEmail(email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || "Failed to authenticate.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) {
        msg = "Invalid email or password.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "This email is already registered. Please sign in.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      } else if (msg.includes("auth/invalid-api-key")) {
        msg = "Firebase API Key is invalid or not yet configured. Please set your VITE_FIREBASE_API_KEY or use Demo mode.";
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.message || "Google sign-in failed. Ensure your Firebase project credentials are set.");
    }
  };

  const handleDemoLogin = () => {
    signInAsDemo();
    onSuccess();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full rounded-3xl glass-panel p-6 sm:p-8 border border-dark-800 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-accent-purple to-accent-cyan p-[2px] shadow-xl shadow-primary-500/30">
            <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {authMode === 'signin' ? 'Sign In to FounderZero' : 'Create Founder Account'}
            </h2>
            <p className="text-xs text-slate-400">Firebase Authentication & Firestore Project: founder-zero</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-dark-900 border border-dark-800">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              authMode === 'signin' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Email Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              authMode === 'signup' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Founder"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-dark-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : authMode === 'signin' ? (
              'Sign In with Email'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-dark-800 w-full" />
          <span className="bg-dark-950 px-3 text-[11px] text-slate-500 uppercase tracking-wider">Or continue with</span>
        </div>

        {/* Google Login & Instant Demo */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs shadow flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google Account</span>
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-400 hover:text-slate-200 font-medium text-xs border border-dark-800 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Instant Demo Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
