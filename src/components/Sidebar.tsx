import React from 'react';
import {
  LayoutDashboard,
  Layers,
  CalendarCheck2,
  TrendingUp,
  Search,
  Code2,
  Flame,
  Award,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { ViewMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeView,
    setActiveView,
    setIsSearchOpen,
    currentSprintId,
    currentDayNum,
    navigateToDay,
    navigateToSprint,
    overallPercentage,
    streak,
    isTodayActive,
    setStreak,
    completedProblemsCount,
    totalProblems
  } = useRoadmap();

  const navItems: { id: ViewMode; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: '16 Sprints Roadmap', icon: Layers, badge: '16' },
    { id: 'day', label: "Today's Task", icon: CalendarCheck2, badge: `S${currentSprintId}·D${currentDayNum}` },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp, badge: `${overallPercentage}%` },
  ];

  const handleNavClick = (view: ViewMode) => {
    if (view === 'day') {
      navigateToDay(currentSprintId, currentDayNum);
    } else {
      setActiveView(view);
    }
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-card border-r border-card-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Brand Header */}
          <div className="p-5 border-b border-card-border flex items-center justify-between">
            <div
              onClick={() => { setActiveView('dashboard'); onClose(); }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-blue-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Planly <span className="text-primary-400 font-bold">DSA</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider block">
                  Personal SDE Roadmap
                </span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search Button */}
          <div className="p-3">
            <button
              onClick={() => { setIsSearchOpen(true); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-slate-400 hover:text-slate-200 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-400 transition-colors" />
                <span>Search problems...</span>
              </div>
              <kbd className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider">
              Study Prep
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-primary-950/70 border border-primary-800/50 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-primary-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sprints Quick Jump Section */}
          <div className="p-3 space-y-2">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Roadmap Sprints</span>
              <span>16</span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto px-1">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((sprintNum) => (
                <button
                  key={sprintNum}
                  onClick={() => {
                    navigateToSprint(sprintNum);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                    currentSprintId === sprintNum
                      ? 'text-amber-400 bg-amber-950/20 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-mono">Sprint {sprintNum}</span>
                  {currentSprintId === sprintNum && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Status Bottom Profile Card */}
        <div className="p-3.5 border-t border-card-border bg-surface-200/50 space-y-3">
          {/* Progress Mini Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Total Progress</span>
              <span className="text-white font-bold">{overallPercentage}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 text-right">
              {completedProblemsCount} / {totalProblems} solved
            </div>
          </div>

          {/* Profile pill */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-card-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary-900/60 border border-primary-700/60 flex items-center justify-center text-primary-300 font-bold text-xs">
                S
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">Shaik</div>
                <div className="text-[10px] text-emerald-400 font-semibold">Active Prep</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
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
              }}
              title={isTodayActive ? `Streak: ${streak} day(s) (Active today! Click to adjust)` : `Streak: ${streak} day(s) (Solve a problem today to extend! Click to adjust)`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-mono font-bold transition-all cursor-pointer ${
                isTodayActive
                  ? 'bg-amber-950/40 text-amber-400 border-amber-800/40 hover:bg-amber-900/40'
                  : streak > 0
                  ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-amber-400'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${isTodayActive ? 'fill-amber-400 text-amber-400' : streak > 0 ? 'text-amber-500 fill-amber-500/40' : 'text-slate-500'}`} />
              <span>{streak}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
