import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, CheckCircle2, Circle, ArrowRight, CornerDownLeft, Layers, Calendar } from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';
import { Problem } from '../types';

export const GlobalSearchModal: React.FC = () => {
  const {
    roadmap,
    isSearchOpen,
    setIsSearchOpen,
    isProblemCompleted,
    navigateToDay
  } = useRoadmap();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Flatten all problems across the roadmap
  const allProblems = useMemo(() => {
    const list: Problem[] = [];
    roadmap.sprints.forEach(s => {
      s.days.forEach(d => {
        d.problems.forEach(p => {
          list.push(p);
        });
      });
    });
    return list;
  }, [roadmap]);

  // Filter problems based on query
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    return allProblems.filter(p => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        `sprint ${p.sprint}`.includes(q) ||
        `day ${p.day}`.includes(q)
      );
    }).slice(0, 40); // limit to top 40 matches
  }, [allProblems, query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  const handleSelect = (problem: Problem) => {
    setIsSearchOpen(false);
    navigateToDay(problem.sprint, problem.day);
    // Smooth scroll to problem after navigation
    setTimeout(() => {
      const el = document.getElementById(`problem-${problem.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] glow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-card-border p-4 flex items-center gap-3 bg-surface-200/90">
          <Search className="w-5 h-5 text-primary-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search problems, topics, days, or sprints (e.g., Two Sum, LRU, Sprint 3)..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-slate-500 text-xs sm:text-sm space-y-2">
              <p>Type to search through all 877 problems across 16 Sprints.</p>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                <span>Try:</span>
                <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-primary-400 cursor-pointer" onClick={() => setQuery('Two Sum')}>Two Sum</span>
                <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-primary-400 cursor-pointer" onClick={() => setQuery('Kadane')}>Kadane</span>
                <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-primary-400 cursor-pointer" onClick={() => setQuery('LRU Cache')}>LRU Cache</span>
                <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-primary-400 cursor-pointer" onClick={() => setQuery('Normalisation')}>Normalisation</span>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching problems found for "{query}".
            </div>
          ) : (
            searchResults.map((problem, idx) => {
              const completed = isProblemCompleted(problem.id);
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={problem.id}
                  onClick={() => handleSelect(problem)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-950/60 border border-primary-500/50'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}

                    <div className="min-w-0">
                      <div className={`text-sm font-semibold truncate ${
                        completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}>
                        {problem.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {problem.topic}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-primary-400 border border-slate-700/60">
                      S{problem.sprint} · D{problem.day}
                    </span>

                    {completed && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}

                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-surface-200 border-t border-card-border flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          {searchResults.length > 0 && (
            <span>{searchResults.length} results</span>
          )}
        </div>
      </div>
    </div>
  );
};
