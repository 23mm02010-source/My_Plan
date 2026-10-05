import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const Breadcrumbs: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedSprintId,
    selectedDayNum,
    navigateToSprint,
    navigateToDay
  } = useRoadmap();

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium select-none overflow-x-auto py-1">
      <button
        onClick={() => setActiveView('dashboard')}
        className="flex items-center gap-1 hover:text-slate-100 transition-colors p-1 rounded hover:bg-slate-800/50"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </button>

      {activeView !== 'dashboard' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => setActiveView('roadmap')}
            className={`hover:text-slate-100 transition-colors p-1 rounded hover:bg-slate-800/50 ${
              activeView === 'roadmap' ? 'text-primary-400 font-semibold' : ''
            }`}
          >
            Roadmap
          </button>
        </>
      )}

      {(activeView === 'sprint' || activeView === 'day') && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => navigateToSprint(selectedSprintId)}
            className={`hover:text-slate-100 transition-colors p-1 rounded hover:bg-slate-800/50 ${
              activeView === 'sprint' ? 'text-primary-400 font-semibold' : ''
            }`}
          >
            Sprint {selectedSprintId}
          </button>
        </>
      )}

      {activeView === 'day' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-primary-400 font-semibold p-1">
            Day {selectedDayNum}
          </span>
        </>
      )}

      {activeView === 'progress' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-primary-400 font-semibold p-1">
            Analytics & Progress
          </span>
        </>
      )}
    </nav>
  );
};
