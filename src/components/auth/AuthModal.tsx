import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AtSign, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginAsDemo } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, instagramHandle);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginAsDemo();
      onClose();
    } catch {
      // Handled in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative w-full max-w-md bg-[#14111C] border border-[#241E30] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#201A28] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {tab === 'login' ? 'Sign In to FollowLens' : 'Create FollowLens Account'}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {tab === 'login'
                ? 'Access your saved snapshots and tracking history'
                : 'Start tracking who unfollows and follows you over time'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1E1828] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-center p-0.5 rounded-lg bg-[#0D0B12] border border-[#201A28]">
            <button
              onClick={() => {
                setTab('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                tab === 'login'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                tab === 'register'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-md bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Vance"
                      className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0D0B12] text-white border border-[#282036] rounded-md focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Instagram Handle (Optional)
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pink-400" />
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="alex.creator"
                      className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0D0B12] text-white border border-[#282036] rounded-md focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0D0B12] text-white border border-[#282036] rounded-md focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0D0B12] text-white border border-[#282036] rounded-md focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-md transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'Processing...'
                : tab === 'login'
                ? 'Sign In'
                : 'Create Account & Continue'}
            </button>
          </form>

          <div className="pt-2 border-t border-[#201A28] text-center">
            <button
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 font-medium py-1 px-2 rounded hover:bg-[#1B1424] transition-colors"
            >
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Sign in with 1-Click Demo Account (Alex Vance)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
