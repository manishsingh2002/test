import { useState, useCallback } from 'react';
import PaperCreator from './components/PaperCreator';
import PaperList from './components/PaperList';
import TestRunner from './components/TestRunner';
import Results from './components/Results';
import AttemptHistory from './components/AttemptHistory';
import { TestAttempt } from './types';
import { getAttempts } from './utils/storage';
import { FileText, Play, PlusCircle, BookOpen } from 'lucide-react';

type View = 'papers' | 'create' | 'test' | 'results' | 'history';

export default function App() {
  const [view, setView] = useState<View>('papers');
  const [activePaper, setActivePaper] = useState<string>('');
  const [currentAttempt, setCurrentAttempt] = useState<TestAttempt | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePaperCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleStartTest = useCallback((paperName: string) => {
    setActivePaper(paperName);
    setView('test');
  }, []);

  const handleSubmit = useCallback((attemptId: string) => {
    const attempts = getAttempts();
    const attempt = attempts.find(a => a.id === attemptId);
    if (attempt) {
      setCurrentAttempt(attempt);
      setView('results');
    }
  }, []);

  const handleViewHistory = useCallback((paperName: string) => {
    setActivePaper(paperName);
    setView('history');
  }, []);

  const handleSelectAttempt = useCallback((attempt: TestAttempt) => {
    setCurrentAttempt(attempt);
    setView('results');
  }, []);

  const handleRetake = useCallback(() => {
    setView('test');
  }, []);

  const handleExitTest = useCallback(() => {
    setView('papers');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-lg">
                <BookOpen size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Mock Test Platform
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView('papers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'papers'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Play size={16} />
                <span className="hidden sm:inline">Take Test</span>
              </button>
              <button
                onClick={() => setView('create')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === 'create'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <PlusCircle size={16} />
                <span className="hidden sm:inline">Create Paper</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'papers' && (
          <PaperList
            onStartTest={handleStartTest}
            onViewHistory={handleViewHistory}
            refreshKey={refreshKey}
          />
        )}
        {view === 'create' && (
          <PaperCreator onPaperCreated={handlePaperCreated} />
        )}
        {view === 'test' && (
          <TestRunner
            paperName={activePaper}
            onSubmit={handleSubmit}
            onExit={handleExitTest}
          />
        )}
        {view === 'results' && currentAttempt && (
          <Results
            attempt={currentAttempt}
            onViewAllAttempts={() => handleViewHistory(currentAttempt.paperName)}
            onRetake={handleRetake}
          />
        )}
        {view === 'history' && (
          <AttemptHistory
            paperName={activePaper}
            onBack={() => setView('papers')}
            onSelectAttempt={handleSelectAttempt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText size={14} />
            <span>Mock Test Platform — Create, Practice, and Improve</span>
          </div>
          <p>Data stored locally in your browser</p>
        </div>
      </footer>
    </div>
  );
}
