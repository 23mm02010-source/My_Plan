import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoadmapProvider, useRoadmap } from './context/RoadmapContext';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SprintList } from './components/SprintList';
import { DayView } from './components/DayView';
import { DailyTaskPage } from './components/DailyTaskPage';
import { ProgressPage } from './components/ProgressPage';
import { GlobalSearchModal } from './components/GlobalSearchModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeView } = useRoadmap();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-mono">Loading your study plan...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'roadmap':
        return <SprintList />;
      case 'sprint':
        return <DayView />;
      case 'day':
        return <DailyTaskPage />;
      case 'progress':
        return <ProgressPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Search Modal (triggered by Ctrl+K) */}
      <GlobalSearchModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RoadmapProvider>
        <AppContent />
      </RoadmapProvider>
    </AuthProvider>
  );
};

export default App;
