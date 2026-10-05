import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { LogIn, UserPlus, LogOut, Mail, Lock, User, BookOpen, ArrowRight, Shield } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, loading, isGuest, signIn, signUp, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setAuthLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setAuthLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setAuthLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) setError(error.message);
    else setSuccess('Account created! Please check your email to confirm.');
    setAuthLoading(false);
  };

  // If Supabase is not configured, just show the app in guest mode
  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  // If user is logged in, show the app
  if (user) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{user.email}</span>
            <button onClick={() => signOut()} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Show auth prompt
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <button onClick={() => { setShowAuth(false); setError(''); setSuccess(''); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">{success}</div>}

            <form onSubmit={authMode === 'login' ? handleSignIn : handleSignUp} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Display Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              {authMode !== 'forgot' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              )}
              <button type="submit" disabled={authLoading} className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
              {authMode === 'login' && (
                <>
                  <p>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign Up</button></p>
                  <p><button onClick={() => setAuthMode('forgot')} className="hover:underline">Forgot password?</button></p>
                </>
              )}
              {(authMode === 'signup' || authMode === 'forgot') && (
                <p>Already have an account? <button onClick={() => setAuthMode('login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign In</button></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Landing Page */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl mb-6">
            <BookOpen size={32} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            SSC CGL Exam Prep
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Your personal online examination center. Import AI-generated papers, take exams, analyze performance, and learn from mistakes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <button onClick={() => { setAuthMode('signup'); setShowAuth(true); }} className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              <UserPlus size={18} /> Create Account
            </button>
            <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <LogIn size={18} /> Sign In
            </button>
          </div>

          <button onClick={() => { setShowAuth(false); }} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Continue as Guest <ArrowRight size={14} />
          </button>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <div className="text-2xl mb-1">📝</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI → JSON → Import</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">📊</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analytics & Insights</p>
            </div>
            <div className="p-3">
              <div className="text-2xl mb-1">🎯</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Smart Practice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Guest mode overlay */}
      {!showAuth && !user && (
        <div className="fixed top-4 right-4 z-50">
          <button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Shield size={12} /> Sign In for Sync
          </button>
        </div>
      )}
    </div>
  );
}
