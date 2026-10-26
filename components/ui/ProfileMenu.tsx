import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Cloud, 
  KeyRound, 
  Monitor, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  ChevronDown, 
  Activity,
  HardDrive
} from 'lucide-react';
import { User } from '../../types';
import { haptic } from '../../utils/haptics';

export interface ProfileMenuProps {
  currentUser: User;
  onOpenSettings: () => void;
  onOpenOfflineSync: () => void;
  onOpenChangePassword: () => void;
  onOpenDesktopInstall: () => void;
  onOpenDiagnostics?: () => void;
  onLogout: () => void;
  canShowSettings?: boolean;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  currentUser,
  onOpenSettings,
  onOpenOfflineSync,
  onOpenChangePassword,
  onOpenDesktopInstall,
  onOpenDiagnostics,
  onLogout,
  canShowSettings = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    haptic.selection();
    setIsOpen(prev => !prev);
  };

  const handleAction = (action: () => void) => {
    haptic.light();
    setIsOpen(false);
    action();
  };

  const initial = currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U';
  const roleDisplay = currentUser.role ? currentUser.role.replace(/_/g, ' ') : 'Staff';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User Profile & Quick Actions Menu"
        className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all select-none min-h-[44px] ${
          isOpen
            ? 'bg-slate-800 border-amber-400/50 shadow-md ring-2 ring-amber-400/20'
            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600'
        }`}
      >
        {/* User Avatar Initial */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs border border-blue-400/30">
            {initial}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
        </div>

        {/* Username & Role Text */}
        <div className="hidden sm:block text-left leading-tight min-w-0 pr-0.5">
          <div className="text-xs font-bold text-slate-100 truncate max-w-[110px] md:max-w-[140px]">
            {currentUser.username}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 capitalize truncate max-w-[110px]">
            {roleDisplay}
          </div>
        </div>

        {/* Chevron Indicator */}
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`} 
        />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150 focus:outline-hidden"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Header Profile Card */}
          <div className="px-4 py-3 border-b border-slate-800/90 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-600 text-white font-black text-base flex items-center justify-center shadow-md border border-blue-400/40 flex-shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-extrabold text-white truncate flex items-center gap-1.5">
                <span>{currentUser.username}</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30">
                  {roleDisplay}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate mt-0.5">
                {currentUser.email || `${currentUser.username.toLowerCase()}@abigengine.com`}
              </div>
            </div>
          </div>

          {/* Core User-Requested Menu Items */}
          <div className="p-2 space-y-1">
            {/* 1. Settings */}
            {canShowSettings && (
              <button
                onClick={() => handleAction(onOpenSettings)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors group min-h-[44px]"
                role="menuitem"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-amber-400/20 group-hover:text-amber-400 transition-colors flex-shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-100">Settings</div>
                  <div className="text-[11px] text-slate-400 truncate">App & Business Configuration</div>
                </div>
              </button>
            )}

            {/* 2. Offline Sync */}
            <button
              onClick={() => handleAction(onOpenOfflineSync)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors group min-h-[44px]"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-blue-400/20 group-hover:text-blue-400 transition-colors flex-shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-100">Offline Sync</div>
                <div className="text-[11px] text-slate-400 truncate">Sync Manager & Cache Health</div>
              </div>
            </button>

            {/* 3. Password Change */}
            <button
              onClick={() => handleAction(onOpenChangePassword)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors group min-h-[44px]"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-emerald-400/20 group-hover:text-emerald-400 transition-colors flex-shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-100">Password Change</div>
                <div className="text-[11px] text-slate-400 truncate">Update Account Credentials</div>
              </div>
            </button>

            {/* 4. Desktop Icon / Install App */}
            <button
              onClick={() => handleAction(onOpenDesktopInstall)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors group min-h-[44px]"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-indigo-400/20 group-hover:text-indigo-400 transition-colors flex-shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Desktop App</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-bold">
                    .EXE
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">Desktop Icon & Local Storage</div>
              </div>
            </button>

            {/* 5. Diagnostics (Optional system check) */}
            {onOpenDiagnostics && (
              <button
                onClick={() => handleAction(onOpenDiagnostics)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors group min-h-[44px]"
                role="menuitem"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-purple-400/20 group-hover:text-purple-400 transition-colors flex-shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-100">System Diagnostics</div>
                  <div className="text-[11px] text-slate-400 truncate">Network & Cloud Latency Test</div>
                </div>
              </button>
            )}
          </div>

          {/* Logout Section */}
          <div className="p-2 border-t border-slate-800/90 mt-1">
            <button
              onClick={() => {
                haptic.warning();
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors group min-h-[44px]"
              role="menuitem"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-colors flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-rose-300">Sign Out</div>
                <div className="text-[11px] text-rose-400/70 truncate">End your active session securely</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
