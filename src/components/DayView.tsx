import React from 'react';
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronLeft
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { ProgressBar } from './ProgressBar';

export const DayView: React.FC = () => {
  const {
    roadmap,
    selectedSprintId,
    navigateToDay,
    setActiveView,
    getDayStats,
    getSprintStats,
    currentSprintId,
    currentDayNum
  } = useRoadmap();

  const sprint = roadmap.sprints.find(s => s.id === selectedSprintId) || roadmap.sprints[0];
  const sprintStats = getSprintStats(selectedSprintId);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Sprint Header Banner */}
      <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 glow-card relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('roadmap')}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>All Sprints</span>
              </button>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-semibold font-mono text-primary-400 uppercase tracking-wider">
                {sprint.subjects.join(' + ')}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Sprint {sprint.id}
              </h1>
              <span className="text-xl font-medium text-slate-400">
                · {sprint.title}
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-xl">
              {sprint.days.length} Days roadmap containing {sprintStats.totalProblems} curated problems. Complete each day's checklist to finish the sprint.
            </p>
          </div>

          {/* Sprint Progress Summary */}
          <div className="bg-surface-200/80 border border-card-border p-4 rounded-xl min-w-[240px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Sprint Completion</span>
              <span className="font-mono font-bold text-primary-400 text-sm">
                {sprintStats.percentage}%
              </span>
            </div>
            <ProgressBar progress={sprintStats.percentage} size="sm" />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>{sprintStats.completedProblems} / {sprintStats.totalProblems} problems</span>
              <span>{sprintStats.completedDays} / {sprintStats.totalDays} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Sprint Schedule ({sprint.days.length} Days)</span>
          <span>Status & Progress</span>
        </div>

        {sprint.days.map((day) => {
          const stats = getDayStats(sprint.id, day.day);
          const isToday = currentSprintId === sprint.id && currentDayNum === day.day;

          return (
            <div
              key={day.day}
              onClick={() => navigateToDay(sprint.id, day.day)}
              className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isToday
                  ? 'bg-card border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : stats.isCompleted
                  ? 'bg-slate-900/40 border-emerald-900/40 hover:bg-slate-900/70 hover:border-emerald-700/50'
                  : 'bg-card border-card-border hover:bg-card-hover hover:border-slate-600/70'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0 pr-4">
                {/* Status Icon */}
                <div className="mt-0.5 sm:mt-0 shrink-0">
                  {stats.isCompleted ? (
                    <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : isToday ? (
                    <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-600/60 flex items-center justify-center text-amber-400 animate-pulse">
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 group-hover:text-slate-300">
                      <Circle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Day Details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-base text-white tracking-tight">
                      Day {day.day}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-sm font-semibold text-slate-300 truncate">
                      {day.title}
                    </span>

                    {isToday && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Today's Focus
                      </span>
                    )}

                    {stats.isCompleted && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Done ✓
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {day.topic} · {day.problems.length} problems to solve
                  </p>
                </div>
              </div>

              {/* Day Progress & Chevron */}
              <div className="flex items-center justify-between sm:justify-end gap-6 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
                <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {stats.completedProblems} / {stats.totalProblems}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary-400">
                      {stats.percentage}%
                    </span>
                  </div>
                  <ProgressBar progress={stats.percentage} size="sm" className="w-28" />
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-800/40 group-hover:bg-primary-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
