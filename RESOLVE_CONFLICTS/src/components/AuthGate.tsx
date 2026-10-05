import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { LogIn, UserPlus, LogOut, Mail, Lock, User, BookOpen } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { user, signIn, signUp, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // ALWAYS render the app - never block on auth
  // This ensures the app works even if Supabase is down

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message || 'Sign in failed');
    else setShowAuth(false);
    setAuthLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) setError(error.message || 'Sign up failed');
    else setShowAuth(false);
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top bar with auth buttons */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                <BookOpen size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">SSC CGL Prep</span>
            </div>
            
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{user.email}</span>
                  <button 
                    onClick={() => signOut()} 
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <LogOut size={12} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { setAuthMode('login'); setShowAuth(true); }} 
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogIn size={12} /> Sign In
                  </button>
                  <button 
                    onClick={() => { setAuthMode('signup'); setShowAuth(true); }} 
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlus size={12} /> Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <button 
                onClick={() => { setShowAuth(false); setError(''); }} 
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={authMode === 'login' ? handleSignIn : handleSignUp} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Display Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Your name" 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="you@example.com" 
                    required 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    minLength={6} 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={authLoading} 
                className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              {authMode === 'login' ? (
                <p>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign Up</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setAuthMode('login')} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign In</button></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content - ALWAYS render the app */}
      <div className="flex-1">
        {children}
      </div>

      {/* Guest mode notice */}
      {!user && (
        <div className="px-4 py-2 text-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Running in <strong>Guest Mode</strong> — data saved locally. 
            <button onClick={() => { setAuthMode('signup'); setShowAuth(true); }} className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
              Sign up
            </button> to sync across devices.
          </p>
        </div>
      )}
    </div>
  );
}
