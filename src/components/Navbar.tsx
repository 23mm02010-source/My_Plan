import React, { useState } from 'react';
import { Menu, Search, Flame, CheckCircle2, Calendar, Database, RefreshCw, Cloud } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { useAuth } from '../context/AuthContext';
import { Breadcrumbs } from './Breadcrumbs';
import { UserProfileMenu } from './UserProfileMenu';
import { CloudDatabaseModal } from './CloudDatabaseModal';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const {
    setIsSearchOpen,
    completedProblemsCount,
    totalProblems,
    streak,
    isTodayActive,
    setStreak,
    currentSprintId,
    currentDayNum,
    navigateToDay,
    isCloudSyncing
  } = useRoadmap();

  const { isCloudConnected } = useAuth();
  const [dbModalOpen, setDbModalOpen] = useState(false);

  const handleStreakClick = () => {
    const input = window.prompt(
      `Your current study streak is ${streak} day(s).\n\nIf you want to sync your streak count with your previous takeUforward streak, enter the number of days:`,
      String(streak)
    );
    if (input !== null) {
      const val = parseInt(input.trim(), 10);
      if (!isNaN(val) && val >= 0) {
        setStreak(val);
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-card-border px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Breadcrumbs />
        </div>

        {/* Right: Search, Streak, Cloud Status, and Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cloud Database Sync Pill */}
          <button
            type="button"
            onClick={() => setDbModalOpen(true)}
            title={
              isCloudSyncing
                ? 'Syncing changes to Cloud Database...'
                : isCloudConnected
                ? 'Cloud Database Connected (Synced across devices)'
                : 'Local Mode: Click to connect Cloud Database for mobile sync'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isCloudSyncing
                ? 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                : isCloudConnected
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-900/40'
            }`}
          >
            {isCloudSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : isCloudConnected ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Database className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden md:inline">
              {isCloudSyncing ? 'Syncing...' : isCloudConnected ? 'Cloud Synced' : 'Connect Cloud'}
            </span>
          </button>

          {/* Search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/60"
            title="Search problems (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Today's shortcut pill */}
          <button
            onClick={() => navigateToDay(currentSprintId, currentDayNum)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-primary-400" />
            <span>Sprint {currentSprintId} · Day {currentDayNum}</span>
          </button>

          {/* Streak Indicator */}
          <button
            type="button"
            onClick={handleStreakClick}
            title={isTodayActive ? `Streak: ${streak} day(s) (Active today! Click to adjust)` : `Streak: ${streak} day(s) (Solve a problem today to extend! Click to adjust)`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
              isTodayActive
                ? 'bg-amber-950/40 text-amber-400 border-amber-800/50 hover:bg-amber-900/40'
                : streak > 0
                ? 'bg-slate-900 text-slate-300 border-slate-700/60 hover:text-amber-400'
                : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isTodayActive ? 'fill-amber-400 text-amber-400 animate-pulse' : streak > 0 ? 'text-amber-500 fill-amber-500/40' : 'text-slate-500'}`} />
            <span>{streak}</span>
          </button>

          {/* Solved Problems Count */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium bg-slate-900/90 text-slate-300 border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{completedProblemsCount} / {totalProblems}</span>
          </div>

          {/* User Account / Profile Menu */}
          <UserProfileMenu />
        </div>
      </header>

      <CloudDatabaseModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </>
  );
};
