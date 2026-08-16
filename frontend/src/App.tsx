import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { ProjectView } from './pages/ProjectView';
import { Login } from './pages/Login';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-primary-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Initializing FounderZero...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        onNewProject={() => setSelectedProjectId(null)}
        onNavigateHome={() => setSelectedProjectId(null)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {isLoginModalOpen && !user ? (
        <Login onSuccess={() => setIsLoginModalOpen(false)} />
      ) : selectedProjectId ? (
        <ProjectView
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
        />
      ) : (
        <Dashboard
          onSelectProject={(id) => setSelectedProjectId(id)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
