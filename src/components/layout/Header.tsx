import React from 'react';
import { Upload, HelpCircle, LogIn, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Snapshot } from '../../types';

interface HeaderProps {
  currentSnapshot: Snapshot | null;
  onOpenUpload: () => void;
  onOpenGuide: () => void;
  onOpenAuth: () => void;
  onToggleMobileNav: () => void;
  activeTabLabel: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentSnapshot,
  onOpenUpload,
  onOpenGuide,
  onOpenAuth,
  onToggleMobileNav,
  activeTabLabel,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  const formattedDate = currentSnapshot
    ? new Date(currentSnapshot.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <header className="sticky top-0 z-30 h-15 bg-[#0D0B12] border-b border-[#201A28] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap">
          <span className="font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>Follow</span>
            <span className="text-purple-400">Lens</span>
          </span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-400 truncate">{activeTabLabel}</span>
        </div>
      </div>

      {/* Zone 2: Snapshot Context */}
      <div className="hidden md:flex items-center gap-3 text-xs text-neutral-400">
        {currentSnapshot ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14111C] border border-[#241E30]">
            <span className="text-neutral-200 font-medium">{currentSnapshot.label}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono tabular-nums">{formattedDate}</span>
          </div>
        ) : (
          <span className="text-neutral-500 italic">No snapshot loaded</span>
        )}
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenGuide}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors whitespace-nowrap"
        >
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
          <span>Export Guide</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Export</span>
        </button>

        {isAuthenticated && user ? (
          <div className="relative group">
            <button
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
              aria-label="User profile options"
            >
              <div className="w-7 h-7 rounded-md bg-purple-700 border border-purple-500/40 flex items-center justify-center text-xs font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-neutral-300 max-w-[100px] truncate">
                {user.instagramHandle ? `@${user.instagramHandle}` : user.name}
              </span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-[#14111C] border border-[#241E30] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-3 py-2 border-b border-[#201A28]">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white rounded-lg border border-[#241E30] bg-[#14111C] hover:bg-[#1A1624] transition-colors whitespace-nowrap"
          >
            <LogIn className="w-3.5 h-3.5 text-purple-400" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
