import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ROADMAP_DATA } from '../data/roadmapData';
import { Problem, Day, Sprint, ViewMode, UserProgressState } from '../types';

interface SubjectStats {
  subject: string;
  total: number;
  completed: number;
  percentage: number;
}

interface SprintStats {
  totalProblems: number;
  completedProblems: number;
  percentage: number;
  isCompleted: boolean;
  totalDays: number;
  completedDays: number;
}

interface DayStats {
  totalProblems: number;
  completedProblems: number;
  percentage: number;
  isCompleted: boolean;
}

interface RoadmapContextType {
  roadmap: typeof ROADMAP_DATA;
  completedProblems: Record<string, boolean>;
  toggleProblem: (problemId: string) => void;
  isProblemCompleted: (problemId: string) => boolean;
  markDayAll: (sprintId: number, dayNum: number, complete: boolean) => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  selectedSprintId: number;
  setSelectedSprintId: (id: number) => void;
  selectedDayNum: number;
  setSelectedDayNum: (day: number) => void;
  currentSprintId: number;
  currentDayNum: number;
  setCurrentActiveDay: (sprintId: number, dayNum: number) => void;
  navigateToDay: (sprintId: number, dayNum: number) => void;
  navigateToSprint: (sprintId: number) => void;
  goToNextDay: () => void;
  goToPrevDay: () => void;
  hasNextDay: boolean;
  hasPrevDay: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  filter: 'all' | 'completed' | 'pending';
  setFilter: (f: 'all' | 'completed' | 'pending') => void;
  totalProblems: number;
  completedProblemsCount: number;
  overallPercentage: number;
  totalTopics: number;
  completedTopicsCount: number;
  completedSprintsCount: number;
  getSprintStats: (sprintId: number) => SprintStats;
  getDayStats: (sprintId: number, dayNum: number) => DayStats;
  getSubjectStats: () => SubjectStats[];
  resetAllProgress: () => void;
  exportProgress: () => void;
  importProgress: (jsonString: string) => boolean;
  streak: number;
  isTodayActive: boolean;
  setStreak: (newStreak: number) => void;
}

const STORAGE_KEY = 'planly_user_progress_v1';

export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getPreviousDateString = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return getLocalDateString(date);
};

export const calculateStreak = (
  activeDates: string[],
  totalCompleted: number,
  manualStreak?: number
): { streak: number; isTodayActive: boolean } => {
  // Rule: If 0 problems solved total, streak is 0
  if (totalCompleted === 0) {
    return { streak: 0, isTodayActive: false };
  }

  const today = getLocalDateString(new Date());
  const datesSet = new Set(activeDates || []);
  const isTodayActive = datesSet.has(today);
  const yesterday = getPreviousDateString(today);

  // Rule: If neither today nor yesterday had a solved problem, the streak has broken
  if (!isTodayActive && !datesSet.has(yesterday)) {
    return { streak: 0, isTodayActive: false };
  }

  // Count consecutive days backward from the last active day
  let consecutiveDays = 0;
  let checkDate = isTodayActive ? today : yesterday;

  while (datesSet.has(checkDate)) {
    consecutiveDays++;
    checkDate = getPreviousDateString(checkDate);
  }

  // If user imported/set a manual starting baseline from their previous streak:
  const baselineOffset = (typeof manualStreak === 'number' && manualStreak > 0)
    ? Math.max(0, manualStreak - 1)
    : 0;

  return { streak: consecutiveDays + baselineOffset, isTodayActive };
};

const saveToStorage = (state: UserProgressState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e: any) {
    console.error('Failed to save progress to localStorage', e);
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      alert('Storage Alert: Your device or browser storage is full. Please clear some disk space so your progress can be saved.');
    }
  }
};

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from localStorage
  const [progressState, setProgressState] = useState<UserProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.completedProblems === 'object') {
          const completedCount = Object.keys(parsed.completedProblems).length;
          return {
            completedProblems: parsed.completedProblems || {},
            bookmarkedProblems: parsed.bookmarkedProblems || {},
            currentSprintId: parsed.currentSprintId || 1,
            currentDayNum: parsed.currentDayNum || 1,
            streak: parsed.streak ?? (completedCount > 0 ? 1 : 0),
            lastActiveDate: parsed.lastActiveDate || getLocalDateString(),
            activeDates: Array.isArray(parsed.activeDates)
              ? parsed.activeDates
              : (completedCount > 0 ? [getLocalDateString()] : []),
            manualStreak: parsed.manualStreak,
            lastActiveView: parsed.lastActiveView || 'dashboard'
          };
        }
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    }
    return {
      completedProblems: {},
      bookmarkedProblems: {},
      currentSprintId: 1,
      currentDayNum: 1,
      streak: 0,
      lastActiveDate: getLocalDateString(),
      activeDates: [],
      lastActiveView: 'dashboard'
    };
  });

  const [activeView, setActiveViewInternal] = useState<ViewMode>(progressState.lastActiveView || 'dashboard');
  const [selectedSprintId, setSelectedSprintId] = useState<number>(progressState.currentSprintId || 1);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(progressState.currentDayNum || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const setActiveView = useCallback((view: ViewMode) => {
    setActiveViewInternal(view);
    setProgressState(prev => {
      const next = { ...prev, lastActiveView: view };
      saveToStorage(next);
      return next;
    });
  }, []);

  // Sync to localStorage as an extra safety measure
  useEffect(() => {
    saveToStorage(progressState);
  }, [progressState]);

  const isProblemCompleted = useCallback((problemId: string): boolean => {
    return !!progressState.completedProblems[problemId];
  }, [progressState.completedProblems]);

  const fireCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const toggleProblem = useCallback((problemId: string) => {
    setProgressState(prev => {
      const isCurrentlyCompleted = !!prev.completedProblems[problemId];
      const updated = { ...prev.completedProblems };
      const today = getLocalDateString();
      const updatedDates = new Set(prev.activeDates || []);
      
      if (isCurrentlyCompleted) {
        delete updated[problemId];
        if (Object.keys(updated).length === 0) {
          updatedDates.clear();
        }
      } else {
        updated[problemId] = true;
        updatedDates.add(today);
      }

      if (!isCurrentlyCompleted) {
        let newlyCompletedDay = false;
        for (const sp of ROADMAP_DATA.sprints) {
          for (const d of sp.days) {
            if (d.problems.some(p => p.id === problemId)) {
              const allDone = d.problems.every(p => p.id === problemId || updated[p.id]);
              if (allDone) {
                newlyCompletedDay = true;
              }
              break;
            }
          }
        }
        if (newlyCompletedDay) {
          fireCelebration();
        }
      }

      const activeDatesArr = Array.from(updatedDates);
      const totalCount = Object.keys(updated).length;
      const { streak: calculatedStreak } = calculateStreak(activeDatesArr, totalCount, prev.manualStreak);

      const next = {
        ...prev,
        completedProblems: updated,
        activeDates: activeDatesArr,
        lastActiveDate: today,
        streak: calculatedStreak
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const markDayAll = useCallback((sprintId: number, dayNum: number, complete: boolean) => {
    const sprint = ROADMAP_DATA.sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    const day = sprint.days.find(d => d.day === dayNum);
    if (!day) return;

    setProgressState(prev => {
      const updated = { ...prev.completedProblems };
      const today = getLocalDateString();
      const updatedDates = new Set(prev.activeDates || []);

      day.problems.forEach(p => {
        if (complete) {
          updated[p.id] = true;
          updatedDates.add(today);
        } else {
          delete updated[p.id];
        }
      });

      if (Object.keys(updated).length === 0) {
        updatedDates.clear();
      }

      if (complete) {
        fireCelebration();
      }

      const activeDatesArr = Array.from(updatedDates);
      const totalCount = Object.keys(updated).length;
      const { streak: calculatedStreak } = calculateStreak(activeDatesArr, totalCount, prev.manualStreak);

      const next = {
        ...prev,
        completedProblems: updated,
        activeDates: activeDatesArr,
        lastActiveDate: today,
        streak: calculatedStreak
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setCurrentActiveDay = useCallback((sprintId: number, dayNum: number) => {
    setProgressState(prev => {
      const next = {
        ...prev,
        currentSprintId: sprintId,
        currentDayNum: dayNum
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const navigateToDay = useCallback((sprintId: number, dayNum: number) => {
    setSelectedSprintId(sprintId);
    setSelectedDayNum(dayNum);
    setActiveViewInternal('day');
    setProgressState(prev => {
      const next = {
        ...prev,
        currentSprintId: sprintId,
        currentDayNum: dayNum,
        lastActiveView: 'day' as ViewMode
      };
      saveToStorage(next);
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToSprint = useCallback((sprintId: number) => {
    setSelectedSprintId(sprintId);
    setActiveViewInternal('sprint');
    setProgressState(prev => {
      const next = {
        ...prev,
        currentSprintId: sprintId,
        lastActiveView: 'sprint' as ViewMode
      };
      saveToStorage(next);
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Next / Prev Day logic
  const daySequence = useMemo(() => {
    const list: { sprintId: number; dayNum: number }[] = [];
    ROADMAP_DATA.sprints.forEach(s => {
      s.days.forEach(d => {
        list.push({ sprintId: s.id, dayNum: d.day });
      });
    });
    return list;
  }, []);

  const currentDayIndex = useMemo(() => {
    return daySequence.findIndex(
      item => item.sprintId === selectedSprintId && item.dayNum === selectedDayNum
    );
  }, [daySequence, selectedSprintId, selectedDayNum]);

  const hasNextDay = currentDayIndex >= 0 && currentDayIndex < daySequence.length - 1;
  const hasPrevDay = currentDayIndex > 0;

  const goToNextDay = useCallback(() => {
    if (hasNextDay) {
      const next = daySequence[currentDayIndex + 1];
      navigateToDay(next.sprintId, next.dayNum);
    }
  }, [hasNextDay, currentDayIndex, daySequence, navigateToDay]);

  const goToPrevDay = useCallback(() => {
    if (hasPrevDay) {
      const prev = daySequence[currentDayIndex - 1];
      navigateToDay(prev.sprintId, prev.dayNum);
    }
  }, [hasPrevDay, currentDayIndex, daySequence, navigateToDay]);

  // Statistics calculations
  const totalProblems = ROADMAP_DATA.totalProblems;

  const completedProblemsCount = useMemo(() => {
    let count = 0;
    ROADMAP_DATA.sprints.forEach(s => {
      s.days.forEach(d => {
        d.problems.forEach(p => {
          if (progressState.completedProblems[p.id]) {
            count++;
          }
        });
      });
    });
    return count;
  }, [progressState.completedProblems]);

  const overallPercentage = useMemo(() => {
    if (totalProblems === 0) return 0;
    return Math.round((completedProblemsCount / totalProblems) * 100);
  }, [completedProblemsCount, totalProblems]);

  const { streak: dynamicStreak, isTodayActive } = useMemo(() => {
    return calculateStreak(
      progressState.activeDates || [],
      completedProblemsCount,
      progressState.manualStreak
    );
  }, [progressState.activeDates, completedProblemsCount, progressState.manualStreak]);

  const setManualStreak = useCallback((newStreak: number) => {
    const valid = Math.max(0, Math.floor(newStreak));
    setProgressState(prev => {
      const next = {
        ...prev,
        manualStreak: valid,
        streak: valid
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  // Day stats
  const getDayStats = useCallback((sprintId: number, dayNum: number): DayStats => {
    const sprint = ROADMAP_DATA.sprints.find(s => s.id === sprintId);
    if (!sprint) return { totalProblems: 0, completedProblems: 0, percentage: 0, isCompleted: false };
    const day = sprint.days.find(d => d.day === dayNum);
    if (!day) return { totalProblems: 0, completedProblems: 0, percentage: 0, isCompleted: false };

    const total = day.problems.length;
    let completed = 0;
    day.problems.forEach(p => {
      if (progressState.completedProblems[p.id]) {
        completed++;
      }
    });

    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      totalProblems: total,
      completedProblems: completed,
      percentage: pct,
      isCompleted: total > 0 && completed === total
    };
  }, [progressState.completedProblems]);

  // Sprint stats
  const getSprintStats = useCallback((sprintId: number): SprintStats => {
    const sprint = ROADMAP_DATA.sprints.find(s => s.id === sprintId);
    if (!sprint) {
      return { totalProblems: 0, completedProblems: 0, percentage: 0, isCompleted: false, totalDays: 0, completedDays: 0 };
    }

    let total = 0;
    let completed = 0;
    let completedDays = 0;

    sprint.days.forEach(d => {
      total += d.problems.length;
      let dayCompletedCount = 0;
      d.problems.forEach(p => {
        if (progressState.completedProblems[p.id]) {
          completed++;
          dayCompletedCount++;
        }
      });
      if (d.problems.length > 0 && dayCompletedCount === d.problems.length) {
        completedDays++;
      }
    });

    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return {
      totalProblems: total,
      completedProblems: completed,
      percentage: pct,
      isCompleted: total > 0 && completed === total,
      totalDays: sprint.days.length,
      completedDays
    };
  }, [progressState.completedProblems]);

  // Topics stats
  const { totalTopics, completedTopicsCount } = useMemo(() => {
    let topicsTotal = 0;
    let topicsDone = 0;

    ROADMAP_DATA.sprints.forEach(s => {
      s.days.forEach(d => {
        topicsTotal++;
        const allDone = d.problems.length > 0 && d.problems.every(p => progressState.completedProblems[p.id]);
        if (allDone) {
          topicsDone++;
        }
      });
    });

    return { totalTopics: topicsTotal, completedTopicsCount: topicsDone };
  }, [progressState.completedProblems]);

  // Completed Sprints count
  const completedSprintsCount = useMemo(() => {
    let count = 0;
    ROADMAP_DATA.sprints.forEach(s => {
      const stats = getSprintStats(s.id);
      if (stats.isCompleted) {
        count++;
      }
    });
    return count;
  }, [getSprintStats]);

  // Subject breakdown stats
  const getSubjectStats = useCallback((): SubjectStats[] => {
    const subjectsMap: Record<string, { total: number; completed: number }> = {
      'DSA': { total: 0, completed: 0 },
      'OOPS': { total: 0, completed: 0 },
      'Operating System': { total: 0, completed: 0 },
      'Computer Networks': { total: 0, completed: 0 },
      'LLD': { total: 0, completed: 0 },
      'DBMS': { total: 0, completed: 0 },
    };

    ROADMAP_DATA.sprints.forEach(s => {
      // Determine subjects in sprint
      s.days.forEach(d => {
        // Tag problems with subject based on title / sprint subjects
        let targetSub = s.subjects[0];
        if (s.subjects.length > 1) {
          const tLower = (d.title + ' ' + d.topic).toLowerCase();
          for (const sub of s.subjects) {
            if (tLower.includes(sub.toLowerCase())) {
              targetSub = sub;
              break;
            }
          }
        }

        d.problems.forEach(p => {
          if (!subjectsMap[targetSub]) {
            subjectsMap[targetSub] = { total: 0, completed: 0 };
          }
          subjectsMap[targetSub].total++;
          if (progressState.completedProblems[p.id]) {
            subjectsMap[targetSub].completed++;
          }
        });
      });
    });

    return Object.entries(subjectsMap).map(([subject, data]) => ({
      subject,
      total: data.total,
      completed: data.completed,
      percentage: data.total === 0 ? 0 : Math.round((data.completed / data.total) * 100)
    }));
  }, [progressState.completedProblems]);

  const resetAllProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all your DSA roadmap progress? This cannot be undone.')) {
      const resetState: UserProgressState = {
        completedProblems: {},
        bookmarkedProblems: {},
        currentSprintId: 1,
        currentDayNum: 1,
        streak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        lastActiveView: 'dashboard'
      };
      setProgressState(resetState);
      saveToStorage(resetState);
    }
  }, []);

  const exportProgress = useCallback(() => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progressState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `my_dsa_plan_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export progress', e);
      alert('Failed to generate export backup file.');
    }
  }, [progressState]);

  const importProgress = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed.completedProblems === 'object') {
        const completedCount = Object.keys(parsed.completedProblems || {}).length;
        const restored: UserProgressState = {
          completedProblems: parsed.completedProblems || {},
          bookmarkedProblems: parsed.bookmarkedProblems || {},
          currentSprintId: parsed.currentSprintId || 1,
          currentDayNum: parsed.currentDayNum || 1,
          streak: parsed.streak ?? (completedCount > 0 ? 1 : 0),
          lastActiveDate: parsed.lastActiveDate || getLocalDateString(),
          activeDates: Array.isArray(parsed.activeDates)
            ? parsed.activeDates
            : (completedCount > 0 ? [getLocalDateString()] : []),
          manualStreak: parsed.manualStreak,
          lastActiveView: parsed.lastActiveView || 'dashboard'
        };
        setProgressState(restored);
        saveToStorage(restored);
        alert('Your study progress was successfully imported and restored!');
        return true;
      }
    } catch (e) {
      console.error('Failed to import progress', e);
      alert('Invalid backup JSON format. Please upload a valid exported backup file.');
    }
    return false;
  }, []);

  return (
    <RoadmapContext.Provider
      value={{
        roadmap: ROADMAP_DATA,
        completedProblems: progressState.completedProblems,
        toggleProblem,
        isProblemCompleted,
        markDayAll,
        activeView,
        setActiveView,
        selectedSprintId,
        setSelectedSprintId,
        selectedDayNum,
        setSelectedDayNum,
        currentSprintId: progressState.currentSprintId,
        currentDayNum: progressState.currentDayNum,
        setCurrentActiveDay,
        navigateToDay,
        navigateToSprint,
        goToNextDay,
        goToPrevDay,
        hasNextDay,
        hasPrevDay,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        filter,
        setFilter,
        totalProblems,
        completedProblemsCount,
        overallPercentage,
        totalTopics,
        completedTopicsCount,
        completedSprintsCount,
        getSprintStats,
        getDayStats,
        getSubjectStats,
        resetAllProgress,
        exportProgress,
        importProgress,
        streak: dynamicStreak,
        isTodayActive,
        setStreak: setManualStreak
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};
