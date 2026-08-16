import React from 'react';
import { Bot, Sparkles, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavbarProps {
  onNewProject?: () => void;
  onNavigateHome?: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewProject, onNavigateHome, onOpenLogin }) => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-dark-950/80 border-b border-dark-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-purple to-accent-cyan p-[1px] shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-dark-950 rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-400 group-hover:text-primary-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Founder<span className="text-primary-400">Zero</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Autonomous AI Co-Founder Engine</p>
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-3">
          {onNewProject && (
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-primary-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Startup</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-dark-800">
              <div className="flex items-center gap-2">
                <img
                  src={user.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=founder'}
                  alt={user.displayName || 'Founder'}
                  className="w-8 h-8 rounded-full ring-2 ring-primary-500/40 bg-dark-800"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.displayName || 'Alex (Founder)'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Online
                  </div>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-850 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-700 text-xs sm:text-sm font-medium transition-all"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
