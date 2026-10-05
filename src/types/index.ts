export interface Problem {
  id: string;
  title: string;
  topic: string;
  day: number;
  sprint: number;
}

export interface Day {
  day: number;
  title: string;
  topic: string;
  problems: Problem[];
}

export interface Sprint {
  id: number;
  title: string;
  subjects: string[];
  days: Day[];
}

export interface Roadmap {
  title: string;
  description: string;
  totalSprints: number;
  totalDays: number;
  totalProblems: number;
  sprints: Sprint[];
}

export type ViewMode = 'dashboard' | 'roadmap' | 'sprint' | 'day' | 'progress';

export interface UserProgressState {
  completedProblems: Record<string, boolean>;
  bookmarkedProblems: Record<string, boolean>;
  currentSprintId: number;
  currentDayNum: number;
  streak: number;
  lastActiveDate: string;
  lastActiveView?: ViewMode;
}
