import { useState, useEffect } from 'react';
import { getPaperById, savePaper, getPapers } from './services/database';
import { DEMO_PAPER } from './utils/demoData';
import { Paper } from './types';
import AuthGate from './components/AuthGate';
import Dashboard from './components/Dashboard';
import JsonImporter from './components/JsonImporter';
import ExamInterface from './components/ExamInterface';
import ResultsPage from './components/ResultsPage';
import { BookOpen, PlusCircle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

type View = 'dashboard' | 'import' | 'exam' | 'results';

function AppContent() {
  const { user } = useAuth();
  const userId = user?.id;

  const [view, setView] = useState<View>('dashboard');
  const [activePaper, setActivePaper] = useState<Paper | null>(null);
  const [examMode, setExamMode] = useState<'exam' | 'practice'>('exam');
  const [lastAttemptId, setLastAttemptId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [demoLoaded, setDemoLoaded] = useState(false);

  // Load demo paper on first visit
  useEffect(() => {
    async function loadDemo() {
      if (demoLoaded) return;
      try {
        const papers = await getPapers(userId);
        if (papers.length === 0) {
          await savePaper({
            user_id: userId || 'guest',
            exam: DEMO_PAPER.exam,
            title: DEMO_PAPER.paperTitle,
            description: DEMO_PAPER.description || '',
            difficulty: DEMO_PAPER.difficulty || 'medium',
            duration_minutes: DEMO_PAPER.durationMinutes,
            total_marks: DEMO_PAPER.totalMarks,
            negative_marking: DEMO_PAPER.negativeMarking || 0,
            question_count: DEMO_PAPER.questions.length,
            subjects: DEMO_PAPER.subjects || [],
            raw_json: DEMO_PAPER,
            is_demo: true,
          });
          setRefreshKey(k => k + 1);
        }
      } catch (e) {
        console.error('Failed to load demo:', e);
      }
      setDemoLoaded(true);
    }
    loadDemo();
  }, [demoLoaded, userId]);

  const handleStartExam = async (paperId: string) => {
    try {
      const paper = await getPaperById(paperId);
      if (paper) {
        setActivePaper(paper);
        setExamMode('exam');
        setView('exam');
      }
    } catch (e) {
      console.error('Failed to start exam:', e);
    }
  };

  const handleStartPractice = async (paperId: string) => {
    try {
      const paper = await getPaperById(paperId);
      if (paper) {
        setActivePaper(paper);
        setExamMode('practice');
        setView('exam');
      }
    } catch (e) {
      console.error('Failed to start practice:', e);
    }
  };

  const handleExamComplete = (attemptId: string) => {
    setLastAttemptId(attemptId);
    setView('results');
    setRefreshKey(k => k + 1);
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setActivePaper(null);
    setRefreshKey(k => k + 1);
  };

  const handleRetake = () => {
    if (activePaper) {
      setView('exam');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      {view !== 'exam' && (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <button onClick={handleBackToDashboard} className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg">
                  <BookOpen size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">SSC CGL Prep</span>
              </button>
              <div className="flex items-center gap-2">
                {view === 'import' && (
                  <button onClick={handleBackToDashboard} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                {view === 'dashboard' && (
                  <button onClick={() => setView('import')} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircle size={16} /> Import Paper
                  </button>
                )}
                {view === 'results' && (
                  <button onClick={handleBackToDashboard} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Home size={16} /> Dashboard
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {view === 'dashboard' && (
          <Dashboard
            userId={userId}
            onStartExam={handleStartExam}
            onPractice={handleStartPractice}
            onImport={() => setView('import')}
            refreshKey={refreshKey}
          />
        )}
        {view === 'import' && (
          <JsonImporter
            userId={userId}
            onImported={() => { setView('dashboard'); setRefreshKey(k => k + 1); }}
          />
        )}
        {view === 'exam' && activePaper && (
          <ExamInterface
            paper={activePaper}
            userId={userId}
            mode={examMode}
            onComplete={handleExamComplete}
            onExit={handleBackToDashboard}
          />
        )}
        {view === 'results' && (
          <ResultsPage
            attemptId={lastAttemptId}
            onRetake={handleRetake}
            onBack={handleBackToDashboard}
            onPractice={() => setView('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      {view !== 'exam' && (
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              SSC CGL Exam Preparation Platform • AI → JSON → Exam → Learn → Improve
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <AppContent />
    </AuthGate>
  );
}
