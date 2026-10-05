import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Problem } from '../types';
import { useRoadmap } from '../context/RoadmapContext';

interface ProblemItemProps {
  problem: Problem;
  index: number;
  highlight?: boolean;
}

export const ProblemItem: React.FC<ProblemItemProps> = ({ problem, index, highlight }) => {
  const { isProblemCompleted, toggleProblem } = useRoadmap();
  const completed = isProblemCompleted(problem.id);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleProblem(problem.id);
  };

  const openSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`leetcode ${problem.title}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => toggleProblem(problem.id)}
      id={`problem-${problem.id}`}
      className={`group flex items-center justify-between py-3.5 px-4 rounded-xl cursor-pointer transition-all duration-200 select-none border ${
        highlight
          ? 'bg-primary-950/40 border-primary-500/60 ring-2 ring-primary-500/30'
          : completed
          ? 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/80 hover:border-slate-700/60'
          : 'bg-card/70 border-card-border/80 hover:bg-card-hover hover:border-slate-600/60'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-4">
        {/* Custom animated checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={completed ? `Mark ${problem.title} incomplete` : `Mark ${problem.title} complete`}
          className={`relative w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 border ${
            completed
              ? 'bg-primary-600 border-primary-500 text-white shadow-sm shadow-primary-500/30'
              : 'border-slate-600 bg-slate-800/60 hover:border-primary-400 hover:bg-slate-800'
          }`}
        >
          {completed && (
            <Check className="w-3.5 h-3.5 stroke-[2.8] animate-check" />
          )}
        </button>

        {/* Index number */}
        <span className="text-xs font-mono text-slate-500 shrink-0 min-w-[20px]">
          {index < 10 ? `0${index}` : index}
        </span>

        {/* Problem Title */}
        <div className="flex flex-col min-w-0">
          <span
            className={`text-sm font-medium transition-all duration-200 truncate ${
              completed
                ? 'line-through text-slate-400 font-normal decoration-slate-600 decoration-1'
                : 'text-slate-100 group-hover:text-primary-300'
            }`}
          >
            {problem.title}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Topic Tag */}
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/90 text-slate-400 border border-slate-700/50">
          {problem.topic}
        </span>

        {/* Google / LeetCode Search Link */}
        <button
          type="button"
          onClick={openSearch}
          title="Search problem on Google / LeetCode"
          className="text-slate-500 hover:text-primary-400 p-1 rounded-md hover:bg-slate-800/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
