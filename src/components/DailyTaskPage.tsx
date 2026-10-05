import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Filter,
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { ProblemItem } from './ProblemItem';
import { ProgressBar } from './ProgressBar';

export const DailyTaskPage: React.FC = () => {
  const {
    roadmap,
    selectedSprintId,
    selectedDayNum,
    getDayStats,
    getSprintStats,
    goToNextDay,
    goToPrevDay,
    hasNextDay,
    hasPrevDay,
    navigateToSprint,
    markDayAll,
    setCurrentActiveDay,
    currentSprintId,
    currentDayNum,
    isProblemCompleted
  } = useRoadmap();

  const [localSearch, setLocalSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  const currentSprint = useMemo(() => {
    return roadmap.sprints.find(s => s.id === selectedSprintId) || roadmap.sprints[0];
  }, [roadmap.sprints, selectedSprintId]);

  const currentDay = useMemo(() => {
    return currentSprint.days.find(d => d.day === selectedDayNum) || currentSprint.days[0];
  }, [currentSprint, selectedDayNum]);

  const dayStats = getDayStats(selectedSprintId, selectedDayNum);
  const sprintStats = getSprintStats(selectedSprintId);

  const isTodayFocus = currentSprintId === selectedSprintId && currentDayNum === selectedDayNum;

  // Group problems by topic
  const groupedProblems = useMemo(() => {
    const groups: Record<string, typeof currentDay.problems> = {};
    currentDay.problems.forEach(p => {
      const topicName = p.topic || currentDay.topic || 'Core Problems';
      if (!groups[topicName]) {
        groups[topicName] = [];
      }
      groups[topicName].push(p);
    });
    return groups;
  }, [currentDay]);

  // Filtered problems
  const filteredGroups = useMemo(() => {
    const result: Record<string, typeof currentDay.problems> = {};

    Object.entries(groupedProblems).forEach(([topic, problems]) => {
      const filtered = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(localSearch.toLowerCase()) ||
          p.topic.toLowerCase().includes(localSearch.toLowerCase());
        const isDone = isProblemCompleted(p.id);

        if (!matchesSearch) return false;
        if (filterMode === 'completed') return isDone;
        if (filterMode === 'pending') return !isDone;
        return true;
      });

      if (filtered.length > 0) {
        result[topic] = filtered;
      }
    });

    return result;
  }, [groupedProblems, localSearch, filterMode, isProblemCompleted]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="relative overflow-hidden bg-card border border-card-border rounded-2xl p-6 sm:p-8 glow-card">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => navigateToSprint(selectedSprintId)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-950/60 text-primary-400 border border-primary-800/40 hover:bg-primary-900/50 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sprint {selectedSprintId}</span>
              </button>

              <span className="text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {currentSprint.title}
              </span>

              {isTodayFocus ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Calendar className="w-3 h-3" />
                  Today's Active Focus
                </span>
              ) : (
                <button
                  onClick={() => setCurrentActiveDay(selectedSprintId, selectedDayNum)}
                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors underline decoration-slate-600 underline-offset-4"
                >
                  Set as Today's Focus
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Day {selectedDayNum}
              </h1>
              <span className="text-lg sm:text-xl font-medium text-slate-400">
                — {currentDay.title}
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-2xl">
              Complete the checklist below to progress through today's roadmap. Progress automatically syncs across topics, sprints, and the overall dashboard.
            </p>
          </div>

          {/* Day Navigation Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={goToPrevDay}
              disabled={!hasPrevDay}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                hasPrevDay
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Day</span>
            </button>

            <button
              onClick={goToNextDay}
              disabled={!hasNextDay}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                hasNextDay
                  ? 'bg-primary-600 border-primary-500 text-white hover:bg-primary-500 shadow-sm shadow-primary-500/30'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <span>Next Day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="mt-8 pt-6 border-t border-card-border/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-400" />
              Today's Progress
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-slate-300">
                <strong className="text-white font-bold">{dayStats.completedProblems}</strong> / {dayStats.totalProblems} completed
              </span>
              <span className="font-mono font-bold text-primary-400 bg-primary-950/60 px-2 py-0.5 rounded border border-primary-800/40">
                {dayStats.percentage}%
              </span>
            </div>
          </div>

          <ProgressBar progress={dayStats.percentage} size="md" />

          {dayStats.isCompleted && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-2 rounded-xl">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>Congratulations! You have completed all assigned problems for Day {selectedDayNum}!</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Actions Bar: Filter, Search, Bulk Mark */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 border border-card-border p-3.5 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search problems in Day..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          {/* Filters */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filterMode === 'all'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({currentDay.problems.length})
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filterMode === 'pending'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({dayStats.totalProblems - dayStats.completedProblems})
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1 rounded-md transition-all font-medium ${
                filterMode === 'completed'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({dayStats.completedProblems})
            </button>
          </div>

          {/* Bulk check / uncheck */}
          <div className="flex items-center gap-1.5 border-l border-slate-700/60 pl-3">
            <button
              onClick={() => markDayAll(selectedSprintId, selectedDayNum, true)}
              title="Mark all problems in this day as completed"
              className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mark All Done</span>
            </button>
            <button
              onClick={() => markDayAll(selectedSprintId, selectedDayNum, false)}
              title="Reset all problems in this day"
              className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* Topics and Problems List */}
      <div className="space-y-6">
        {Object.keys(filteredGroups).length === 0 ? (
          <div className="text-center py-16 bg-card/40 border border-card-border/60 rounded-2xl p-6">
            <p className="text-slate-400 text-sm">
              No problems found matching your current search or filter.
            </p>
            <button
              onClick={() => {
                setLocalSearch('');
                setFilterMode('all');
              }}
              className="mt-3 text-xs text-primary-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([topicTitle, problems], topicIdx) => {
            const topicCompletedCount = problems.filter(p => isProblemCompleted(p.id)).length;
            const topicTotal = problems.length;
            const topicDone = topicTotal > 0 && topicCompletedCount === topicTotal;

            return (
              <div
                key={topicTitle}
                className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Topic Header Bar */}
                <div className="bg-surface-200/90 px-5 py-3.5 border-b border-card-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Topic {topicIdx + 1}
                    </span>
                    <span className="text-slate-600">•</span>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {topicTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      {topicCompletedCount} / {topicTotal}
                    </span>
                    {topicDone && (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Problem items list */}
                <div className="p-3 sm:p-4 space-y-2">
                  {problems.map((problem, pIdx) => (
                    <ProblemItem
                      key={problem.id}
                      problem={problem}
                      index={pIdx + 1}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-card-border">
        <button
          onClick={goToPrevDay}
          disabled={!hasPrevDay}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            hasPrevDay
              ? 'bg-card border-card-border text-slate-200 hover:bg-card-hover'
              : 'bg-card/40 border-card-border/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Day</span>
        </button>

        <span className="text-xs font-mono text-slate-500">
          Day {selectedDayNum} of {currentSprint.days.length} in Sprint {selectedSprintId}
        </span>

        <button
          onClick={goToNextDay}
          disabled={!hasNextDay}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            hasNextDay
              ? 'bg-primary-600 border-primary-500 text-white hover:bg-primary-500 shadow-md shadow-primary-600/30'
              : 'bg-card/40 border-card-border/40 text-slate-600 cursor-not-allowed'
          }`}
        >
          <span>Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
