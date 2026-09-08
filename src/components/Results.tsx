import { TestAttempt, TestPaper } from '../types';
import { getPaper } from '../utils/storage';
import { CheckCircle, XCircle, MinusCircle, Trophy, Target, Clock, BarChart3 } from 'lucide-react';

interface ResultsProps {
  attempt: TestAttempt;
  onViewAllAttempts: () => void;
  onRetake: () => void;
}

export default function Results({ attempt, onViewAllAttempts, onRetake }: ResultsProps) {
  const paper: TestPaper | undefined = getPaper(attempt.paperName);

  const getOptionText = (questionId: string, optionId: string): string => {
    if (!paper) return optionId;
    const question = paper.questions.find(q => q.id === questionId);
    if (!question) return optionId;
    const option = question.options.find(o => o.id === optionId);
    return option ? option.text : optionId;
  };

  const getAnswerDisplay = (questionId: string, answer: string | string[] | null): string => {
    if (answer === null) return 'Not attempted';
    if (Array.isArray(answer)) {
      if (answer.length === 0) return 'Not attempted';
      return answer.map(id => `${id}) ${getOptionText(questionId, id)}`).join(', ');
    }
    return `${answer}) ${getOptionText(questionId, answer)}`;
  };

  const scoreColor = attempt.percentage >= 70 ? 'text-green-600' :
                     attempt.percentage >= 40 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
          <Trophy size={40} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Test Completed!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {attempt.paperName}
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold ${scoreColor} mb-2`}>
            {attempt.score}/{attempt.totalMarks}
          </div>
          <div className={`text-2xl font-semibold ${scoreColor}`}>
            {attempt.percentage}%
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle size={24} className="mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{attempt.correct}</div>
            <div className="text-xs text-green-600 dark:text-green-500">Correct</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <XCircle size={24} className="mx-auto text-red-600 mb-1" />
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{attempt.wrong}</div>
            <div className="text-xs text-red-600 dark:text-red-500">Wrong</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <MinusCircle size={24} className="mx-auto text-gray-600 mb-1" />
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-400">{attempt.skipped}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Skipped</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Target size={24} className="mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{attempt.attempted}</div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Attempted</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Time: {attempt.timeTaken}
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 size={14} />
            Attempted on: {new Date(attempt.attemptedOn).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Question-wise Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Question-wise Breakdown
        </h2>
        <div className="space-y-4">
          {attempt.questionWiseResult.map((result, idx) => {
            const question = paper?.questions.find(q => q.id === result.id);
            if (!question) return null;

            return (
              <div
                key={result.id}
                className={`p-4 rounded-xl border-2 ${
                  result.status === 'correct'
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                    : result.status === 'wrong'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {idx + 1}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      result.status === 'correct'
                        ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                        : result.status === 'wrong'
                        ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {result.status === 'correct' ? `+${result.marksAwarded}` : result.marksAwarded}
                    </span>
                  </div>
                  {result.status === 'correct' && <CheckCircle size={20} className="text-green-600" />}
                  {result.status === 'wrong' && <XCircle size={20} className="text-red-600" />}
                  {result.status === 'skipped' && <MinusCircle size={20} className="text-gray-500" />}
                </div>
                <p className="text-sm text-gray-900 dark:text-white mb-2 font-medium">
                  {question.questionText}
                </p>
                <div className="text-sm space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Your answer:</span>{' '}
                    <span className={
                      result.status === 'correct' ? 'text-green-700 dark:text-green-400' :
                      result.status === 'wrong' ? 'text-red-700 dark:text-red-400' :
                      'text-gray-500'
                    }>
                      {getAnswerDisplay(result.id, result.userAnswer)}
                    </span>
                  </p>
                  {result.status !== 'correct' && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Correct answer:</span>{' '}
                      <span className="text-green-700 dark:text-green-400">
                        {getAnswerDisplay(result.id, result.correctAnswer)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRetake}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Retake Test
        </button>
        <button
          onClick={onViewAllAttempts}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          View All Attempts
        </button>
      </div>
    </div>
  );
}
