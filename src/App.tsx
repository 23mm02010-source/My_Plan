import React, { useState } from 'react';
import { RoadmapProvider, useRoadmap } from './context/RoadmapContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SprintList } from './components/SprintList';
import { DayView } from './components/DayView';
import { DailyTaskPage } from './components/DailyTaskPage';
import { ProgressPage } from './components/ProgressPage';
import { GlobalSearchModal } from './components/GlobalSearchModal';

const AppContent: React.FC = () => {
  const { activeView } = useRoadmap();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <RoadmapProvider>
      <AppContent />
    </RoadmapProvider>
  );
};

export default App;
