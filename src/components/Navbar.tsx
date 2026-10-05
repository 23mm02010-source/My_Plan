import React from 'react';
import { Menu, Search, Flame, CheckCircle2, Calendar } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { Breadcrumbs } from './Breadcrumbs';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const {
    setIsSearchOpen,
    completedProblemsCount,
    totalProblems,
    streak,
    currentSprintId,
    currentDayNum,
    navigateToDay
  } = useRoadmap();

  return (
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

      {/* Right: Search, Streak, and Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-950/30 text-amber-400 border border-amber-800/40">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>{streak}</span>
        </div>

        {/* Solved Problems Count */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium bg-slate-900/90 text-slate-300 border border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{completedProblemsCount} / {totalProblems}</span>
        </div>
      </div>
    </header>
  );
};
