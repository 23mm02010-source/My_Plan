import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Layers,
  BookOpen,
  Code2,
  TrendingUp,
  Sparkles,
  Target
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { ProgressBar } from './ProgressBar';
import { ProgressRing } from './ProgressRing';

export const Dashboard: React.FC = () => {
  const {
    roadmap,
    completedProblemsCount,
    totalProblems,
    overallPercentage,
    totalTopics,
    completedTopicsCount,
    completedSprintsCount,
    currentSprintId,
    currentDayNum,
    navigateToDay,
    navigateToSprint,
    setActiveView,
    getDayStats,
    getSprintStats,
    getSubjectStats,
    streak,
    isTodayActive,
    setStreak
  } = useRoadmap();

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

  const currentSprint = roadmap.sprints.find(s => s.id === currentSprintId) || roadmap.sprints[0];
  const currentDay = currentSprint.days.find(d => d.day === currentDayNum) || currentSprint.days[0];

  const todayStats = getDayStats(currentSprintId, currentDayNum);
  const currentSprintStats = getSprintStats(currentSprintId);
  const subjectStats = getSubjectStats();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Welcome & Streak Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-400 font-mono uppercase tracking-wider">
            <span>TakeUforward Planly Personal Edition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            DSA Preparation Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your 16-Sprint journey through DSA, OOPS, Operating Systems, Computer Networks, LLD, and DBMS.
          </p>
        </div>

        {/* Streak & Overall Stats Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div
            onClick={handleStreakClick}
            title={isTodayActive ? `Streak: ${streak} day(s) (Active today! Click to adjust)` : `Streak: ${streak} day(s) (Solve a problem today to extend! Click to adjust)`}
            className="flex items-center gap-2 bg-card border border-card-border px-3.5 py-2 rounded-2xl shadow-sm cursor-pointer hover:border-amber-500/50 transition-colors group"
          >
            <Flame className={`w-5 h-5 ${isTodayActive ? 'text-amber-500 fill-amber-500 animate-pulse' : streak > 0 ? 'text-amber-500 fill-amber-500/40' : 'text-slate-500'}`} />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400 group-hover:text-amber-400 transition-colors">Current Streak</div>
              <div className="text-sm font-bold font-mono text-white">{streak} Days</div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-card border border-card-border px-3.5 py-2 rounded-2xl shadow-sm">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-400">Roadmap Status</div>
              <div className="text-sm font-bold font-mono text-emerald-400">{overallPercentage}% Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: Today's Task & Continue CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-surface-300 border border-card-border rounded-3xl p-6 sm:p-8 glow-card">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>TODAY'S TASK</span>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-400 font-mono">
                <span>Sprint {currentSprintId}: {currentSprint.title}</span>
                <span>•</span>
                <span>Day {currentDayNum}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {currentDay.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1.5">
                Topic: <strong className="text-white">{currentDay.topic}</strong> · {currentDay.problems.length} problems assigned today.
              </p>
            </div>

            {/* Today's Mini Progress */}
            <div className="space-y-2 pt-2 max-w-md">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Today's Progress</span>
                <span className="text-white font-bold">
                  {todayStats.completedProblems} / {todayStats.totalProblems} completed ({todayStats.percentage}%)
                </span>
              </div>
              <ProgressBar progress={todayStats.percentage} size="md" />
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => navigateToDay(currentSprintId, currentDayNum)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:translate-y-[-1px]"
              >
                <span>Continue Today's Problems</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Large Circular Gauge for Overall Progress */}
          <div className="flex flex-col items-center justify-center p-6 bg-surface-200/60 border border-card-border rounded-2xl min-w-[260px] self-center lg:self-auto">
            <ProgressRing progress={overallPercentage} size={150} strokeWidth={11} subtitle="Roadmap" />
            <div className="mt-4 text-center">
              <div className="text-xs font-mono text-slate-400">
                <span className="text-white font-bold">{completedProblemsCount}</span> of {totalProblems} problems
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {completedSprintsCount} of 16 sprints completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Problems */}
        <div className="bg-card border border-card-border p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Problems</span>
            <Code2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {completedProblemsCount} <span className="text-base text-slate-500 font-normal">/ {totalProblems}</span>
            </div>
            <div className="mt-2">
              <ProgressBar progress={overallPercentage} size="sm" />
            </div>
          </div>
        </div>

        {/* Topics Completed */}
        <div className="bg-card border border-card-border p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Topics</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {completedTopicsCount} <span className="text-base text-slate-500 font-normal">/ {totalTopics}</span>
            </div>
            <div className="mt-2">
              <ProgressBar progress={(completedTopicsCount / (totalTopics || 1)) * 100} size="sm" color="bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Current Sprint Progress */}
        <div className="bg-card border border-card-border p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Sprint {currentSprintId}</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {currentSprintStats.completedDays} <span className="text-base text-slate-500 font-normal">/ {currentSprintStats.totalDays} Days</span>
            </div>
            <div className="mt-2">
              <ProgressBar progress={currentSprintStats.percentage} size="sm" color="bg-indigo-500" />
            </div>
          </div>
        </div>

        {/* Completed Sprints */}
        <div className="bg-card border border-card-border p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Sprints Done</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {completedSprintsCount} <span className="text-base text-slate-500 font-normal">/ 16</span>
            </div>
            <div className="mt-2">
              <ProgressBar progress={(completedSprintsCount / 16) * 100} size="sm" color="bg-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Domain Breakdown */}
      <div className="bg-card border border-card-border p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Subject Mastery Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Progress across core interview preparation domains
            </p>
          </div>
          <button
            onClick={() => setActiveView('progress')}
            className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
          >
            <span>Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats.map(({ subject, total, completed, percentage }) => (
            <div
              key={subject}
              className="p-4 rounded-xl bg-surface-200/80 border border-card-border space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{subject}</span>
                <span className="text-xs font-mono font-bold text-primary-400">{percentage}%</span>
              </div>
              <ProgressBar progress={percentage} size="sm" />
              <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                <span>Completed</span>
                <span>{completed} / {total} problems</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sprint Roadmap Quick Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              16 Sprints Overview
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Jump directly into any sprint or day
            </p>
          </div>
          <button
            onClick={() => setActiveView('roadmap')}
            className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
          >
            <span>View All Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {roadmap.sprints.map((sprint) => {
            const stats = getSprintStats(sprint.id);
            const isCurrent = sprint.id === currentSprintId;

            return (
              <div
                key={sprint.id}
                onClick={() => navigateToSprint(sprint.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-card border-primary-500/60 ring-1 ring-primary-500/20'
                    : stats.isCompleted
                    ? 'bg-slate-900/40 border-emerald-800/40 hover:bg-slate-900/80'
                    : 'bg-card border-card-border hover:bg-card-hover hover:border-slate-600'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold font-mono text-primary-400">
                      Sprint {sprint.id}
                    </span>
                    {stats.isCompleted ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">
                        {stats.percentage}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {sprint.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5">
                  <ProgressBar progress={stats.percentage} size="sm" />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{stats.completedProblems}/{stats.totalProblems} p</span>
                    <span>{stats.completedDays}/{stats.totalDays} d</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
