import { useState } from 'react';
import { TestPaper } from '../types';
import { getPapers, deletePaper, getAttemptsByPaper } from '../utils/storage';
import { Play, Trash2, Clock, FileText, BarChart3, History } from 'lucide-react';

interface PaperListProps {
  onStartTest: (paperName: string) => void;
  onViewHistory: (paperName: string) => void;
  refreshKey: number;
}

export default function PaperList({ onStartTest, onViewHistory, refreshKey }: PaperListProps) {
  const [papers, setPapers] = useState<TestPaper[]>(() => getPapers());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Refresh papers when refreshKey changes
  useState(() => {
    setPapers(getPapers());
  });

  const handleRefresh = () => {
    setPapers(getPapers());
  };

  // Also refresh on mount / when refreshKey changes
  const currentPapers = getPapers();

  const handleDelete = (paperName: string) => {
    deletePaper(paperName);
    setPapers(getPapers());
    setDeleteConfirm(null);
  };

  if (currentPapers.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Available Papers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Select a paper to start a mock test.
        </p>
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            No papers available
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Create a paper first from the "Create Paper" tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Available Papers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a paper to start a mock test.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {currentPapers.map((paper) => {
          const attempts = getAttemptsByPaper(paper.paperName);
          const bestScore = attempts.length > 0
            ? Math.max(...attempts.map(a => a.percentage))
            : null;

          return (
            <div
              key={paper.paperName}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {paper.paperName}
                  </h3>
                  {paper.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {paper.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {paper.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 size={14} />
                      {paper.totalMarks} Marks
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {paper.duration} min
                    </span>
                    {paper.negativeMarking > 0 && (
                      <span className="text-red-500">
                        -{paper.negativeMarking} marking
                      </span>
                    )}
                  </div>
                  {attempts.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <History size={12} className="inline mr-1" />
                      {attempts.length} attempt{attempts.length > 1 ? 's' : ''}
                      {bestScore !== null && ` • Best: ${bestScore}%`}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewHistory(paper.paperName)}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <History size={16} />
                    History
                  </button>
                  <button
                    onClick={() => onStartTest(paper.paperName)}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Play size={16} />
                    Start Test
                  </button>
                  {deleteConfirm === paper.paperName ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(paper.paperName)}
                        className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(paper.paperName)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
