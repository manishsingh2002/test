import { TestAttempt } from '../types';
import { getAttemptsByPaper } from '../utils/storage';
import { Clock, BarChart3, CheckCircle, XCircle, ArrowLeft, Trophy } from 'lucide-react';

interface AttemptHistoryProps {
  paperName: string;
  onBack: () => void;
  onSelectAttempt: (attempt: TestAttempt) => void;
}

export default function AttemptHistory({ paperName, onBack, onSelectAttempt }: AttemptHistoryProps) {
  const attempts = getAttemptsByPaper(paperName).sort(
    (a, b) => new Date(b.attemptedOn).getTime() - new Date(a.attemptedOn).getTime()
  );

  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map(a => a.percentage))
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Papers
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Attempt History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {paperName}
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            No attempts yet
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Take the test to see your results here.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{attempts.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Attempts</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{bestScore}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Best Score</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Average Score</div>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {attempts.reduce((sum, a) => sum + a.correct, 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Correct</div>
            </div>
          </div>

          {/* Attempts List */}
          <div className="space-y-3">
            {attempts.map((attempt, idx) => (
              <button
                key={attempt.id}
                onClick={() => onSelectAttempt(attempt)}
                className="w-full text-left p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      attempt.percentage >= 70 ? 'bg-green-100 dark:bg-green-900/30' :
                      attempt.percentage >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {attempt.percentage === bestScore ? (
                        <Trophy size={20} className="text-yellow-600" />
                      ) : (
                        <span className={`text-sm font-bold ${
                          attempt.percentage >= 70 ? 'text-green-700 dark:text-green-400' :
                          attempt.percentage >= 40 ? 'text-yellow-700 dark:text-yellow-400' :
                          'text-red-700 dark:text-red-400'
                        }`}>
                          #{idx + 1}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Attempt #{idx + 1}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(attempt.attemptedOn).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock size={14} />
                      {attempt.timeTaken}
                    </span>
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} />
                      {attempt.correct}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle size={14} />
                      {attempt.wrong}
                    </span>
                    <span className={`font-bold text-lg ${
                      attempt.percentage >= 70 ? 'text-green-600' :
                      attempt.percentage >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {attempt.score}/{attempt.totalMarks}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      attempt.percentage >= 70 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      attempt.percentage >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {attempt.percentage}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
