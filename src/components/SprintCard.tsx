import React from 'react';
import { Check } from 'lucide-react';
import { Sprint } from '../types';
import { useRoadmap } from '../context/RoadmapContext';
import { ProgressBar } from './ProgressBar';

interface SprintCardProps {
  sprint: Sprint;
}

export const SprintCard: React.FC<SprintCardProps> = ({ sprint }) => {
  const {
    navigateToSprint,
    getSprintStats,
    currentSprintId
  } = useRoadmap();

  const stats = getSprintStats(sprint.id);
  const isActive = currentSprintId === sprint.id;

  return (
    <div
      onClick={() => navigateToSprint(sprint.id)}
      className={`group relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
        isActive
          ? 'bg-card border-primary-500/60 shadow-lg shadow-primary-500/10 ring-1 ring-primary-500/30'
          : stats.isCompleted
          ? 'bg-slate-900/40 border-emerald-900/40 hover:bg-slate-900/70 hover:border-emerald-700/60'
          : 'bg-card border-card-border hover:bg-card-hover hover:border-slate-600/70'
      }`}
    >
      {/* Top Meta */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wider border ${
                isActive
                  ? 'bg-primary-950/80 text-primary-400 border-primary-700/50'
                  : stats.isCompleted
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
              }`}
            >
              Sprint {sprint.id}
            </span>

            {isActive && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
                Active Focus
              </span>
            )}
          </div>

          {stats.isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
              <Check className="w-3.5 h-3.5" />
              Completed
            </span>
          ) : (
            <span className="text-xs font-mono font-bold text-slate-300">
              {stats.percentage}%
            </span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition-colors">
            {sprint.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {sprint.subjects.map(sub => (
              <span
                key={sub}
                className="text-[11px] font-medium px-2 py-0.5 rounded bg-surface-300/80 text-slate-400 border border-card-border"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Progress & Bottom Bar */}
      <div className="mt-6 pt-4 border-t border-card-border/80 space-y-3">
        <ProgressBar progress={stats.percentage} size="sm" />

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{stats.completedDays} / {stats.totalDays} days</span>
          <span>{stats.completedProblems} / {stats.totalProblems} problems</span>
        </div>
      </div>
    </div>
  );
};
