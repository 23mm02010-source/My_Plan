import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Users, ChevronDown, Check, Database, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CloudDatabaseModal } from './CloudDatabaseModal';

export const UserProfileMenu: React.FC = () => {
  const { user, logout, allUsers, login, isCloudConnected, cloudStatus } = useAuth();
  const [open, setOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 transition-all"
          title="Account & Profile"
        >
          <div className="w-6 h-6 rounded-lg bg-primary-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {initials}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold leading-none text-white truncate max-w-[110px]">
              {user.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono leading-none mt-1 truncate max-w-[110px]">
              {user.email}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-card border border-card-border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 glow-card">
            <div className="p-3 border-b border-card-border space-y-1">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {isCloudConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Local Storage
                  </span>
                )}
              </div>
            </div>

            {/* Cloud Database Settings Item */}
            <div className="py-1 border-b border-card-border">
              <button
                onClick={() => {
                  setOpen(false);
                  setDbModalOpen(true);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-primary-400" />
                <span>Cloud Database Settings</span>
              </button>
            </div>

            {/* Switch Accounts section if multiple registered */}
            {allUsers.length > 1 && (
              <div className="py-2 border-b border-card-border space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  <span>Switch Account</span>
                </div>
                {allUsers.map((u) => {
                  const isCurrent = u.id === user.id;
                  return (
                    <button
                      key={u.id}
                      disabled={isCurrent}
                      onClick={() => {
                        const pwd = window.prompt(`Enter password to switch to ${u.email}:`);
                        if (pwd) {
                          login(u.email, pwd).then(res => {
                            if (res.success) {
                              setOpen(false);
                            } else {
                              alert(res.error || 'Password incorrect.');
                            }
                          });
                        }
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                        isCurrent
                          ? 'bg-primary-950/60 text-primary-300 font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate">{u.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-primary-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Logout Action */}
            <div className="pt-1">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out?')) {
                    logout();
                    setOpen(false);
                  }
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <CloudDatabaseModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </>
  );
};
