import React, { useState, useMemo } from 'react';
import { Layers, Search, Filter, CheckCircle2, Circle } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { SprintCard } from './SprintCard';

export const SprintList: React.FC = () => {
  const { roadmap, getSprintStats } = useRoadmap();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [search, setSearch] = useState('');

  const allSubjects = ['DSA', 'OOPS', 'Operating System', 'Computer Networks', 'LLD', 'DBMS'];

  const filteredSprints = useMemo(() => {
    return roadmap.sprints.filter(sprint => {
      const stats = getSprintStats(sprint.id);
      const matchesSearch = sprint.title.toLowerCase().includes(search.toLowerCase()) ||
        sprint.subjects.some(sub => sub.toLowerCase().includes(search.toLowerCase())) ||
        `sprint ${sprint.id}`.includes(search.toLowerCase());

      const matchesSubject = filterSubject === 'all' || sprint.subjects.includes(filterSubject);

      let matchesStatus = true;
      if (filterStatus === 'completed') {
        matchesStatus = stats.isCompleted;
      } else if (filterStatus === 'in-progress') {
        matchesStatus = !stats.isCompleted;
      }

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [roadmap.sprints, search, filterSubject, filterStatus, getSprintStats]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-400 uppercase tracking-wider font-mono">
          <Layers className="w-4 h-4" />
          <span>Full Roadmap Overview</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              16 Sprints Roadmap
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select any sprint to view daily problem breakdowns, milestones, and progress.
            </p>
          </div>

          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            16 in total · {roadmap.totalDays} Days · {roadmap.totalProblems} Problems
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-card-border p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sprint by title or subject..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              filterSubject === 'all'
                ? 'bg-primary-600 text-white font-semibold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Subjects
          </button>
          {allSubjects.map(sub => (
            <button
              key={sub}
              onClick={() => setFilterSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                filterSubject === sub
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Sprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSprints.map(sprint => (
          <SprintCard key={sprint.id} sprint={sprint} />
        ))}
      </div>

      {filteredSprints.length === 0 && (
        <div className="text-center py-16 bg-card border border-card-border rounded-2xl p-6">
          <p className="text-slate-400 text-sm">
            No sprints found matching your current search or filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setFilterSubject('all');
              setFilterStatus('all');
            }}
            className="mt-3 text-xs text-primary-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
};
