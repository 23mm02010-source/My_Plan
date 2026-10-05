import React from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  Flame,
  Code2,
  Layers,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { ProgressBar } from './ProgressBar';
import { ProgressRing } from './ProgressRing';

export const ProgressPage: React.FC = () => {
  const {
    roadmap,
    completedProblemsCount,
    totalProblems,
    overallPercentage,
    completedTopicsCount,
    totalTopics,
    completedSprintsCount,
    getSprintStats,
    getSubjectStats,
    navigateToSprint,
    resetAllProgress,
    streak
  } = useRoadmap();

  const subjectStats = getSubjectStats();
  const remainingProblems = totalProblems - completedProblemsCount;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-400 font-mono uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Comprehensive Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            Progress & Milestone Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detailed breakdown of your problem checklist across all 16 sprints and core technical domains.
          </p>
        </div>

        <button
          onClick={resetAllProgress}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-950/30 border border-rose-800/40 hover:bg-rose-900/40 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Progress</span>
        </button>
      </div>

      {/* Main Highlights Card */}
      <div className="bg-card border border-card-border rounded-3xl p-6 sm:p-8 glow-card grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Progress Ring */}
        <div className="flex flex-col items-center justify-center p-4">
          <ProgressRing progress={overallPercentage} size={180} strokeWidth={14} subtitle="Mastered" />
          <span className="text-xs font-mono text-slate-400 mt-4 text-center">
            {completedProblemsCount} of {totalProblems} problems completed
          </span>
        </div>

        {/* Breakdown Stats */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white">Overall Roadmap Completion</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consistent daily practice ensures retention and interview readiness.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-200/80 border border-card-border p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completed</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                {completedProblemsCount}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {overallPercentage}% of total
              </span>
            </div>

            <div className="bg-surface-200/80 border border-card-border p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Remaining</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-200 mt-2">
                {remainingProblems}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {100 - overallPercentage}% to solve
              </span>
            </div>

            <div className="bg-surface-200/80 border border-card-border p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Sprints Completed</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {completedSprintsCount} <span className="text-sm font-normal text-slate-500">/ 16</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {16 - completedSprintsCount} sprints active
              </span>
            </div>

            <div className="bg-surface-200/80 border border-card-border p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Current Streak</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {streak} <span className="text-sm font-normal text-slate-500">Days</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Keep the momentum going!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Domain Performance */}
      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Subject-wise Mastery</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your progress categorized by foundational technical disciplines
          </p>
        </div>

        <div className="space-y-4">
          {subjectStats.map(({ subject, total, completed, percentage }) => (
            <div key={subject} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200">{subject}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-slate-400">{completed} / {total} problems</span>
                  <span className="font-bold text-primary-400 min-w-[35px] text-right">{percentage}%</span>
                </div>
              </div>
              <ProgressBar progress={percentage} size="md" />
            </div>
          ))}
        </div>
      </div>

      {/* All 16 Sprints Detailed Progress Table */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-card-border">
          <h2 className="text-lg font-bold text-white">All 16 Sprints Completion Tracker</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any sprint row to view its daily questions
          </p>
        </div>

        <div className="divide-y divide-card-border">
          {roadmap.sprints.map(sprint => {
            const stats = getSprintStats(sprint.id);

            return (
              <div
                key={sprint.id}
                onClick={() => navigateToSprint(sprint.id)}
                className="p-4 sm:p-5 hover:bg-card-hover cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary-400">
                      Sprint {sprint.id}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-medium text-slate-400">
                      {sprint.days.length} Days
                    </span>
                    {stats.isCompleted && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        100% Done
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {sprint.title}
                  </h4>
                </div>

                <div className="flex items-center gap-6 flex-1 sm:max-w-md">
                  <div className="flex-1 space-y-1.5">
                    <ProgressBar progress={stats.percentage} size="sm" />
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{stats.completedProblems} / {stats.totalProblems} problems</span>
                      <span>{stats.completedDays} / {stats.totalDays} days</span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-xs text-slate-200 min-w-[36px] text-right">
                    {stats.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
