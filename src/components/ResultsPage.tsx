import { useState, useEffect } from 'react';
import { Attempt, AttemptQuestion, Paper, QuestionJSON } from '../types';
import { getAttempts, getAttemptQuestions, getPaperById } from '../services/database';
import { calculateSubjectPerformance, calculateTopicPerformance, formatTime, getAccuracyColor } from '../utils/grader';
import { Trophy, Target, Clock, CheckCircle, XCircle, MinusCircle, BarChart3, TrendingUp, Lightbulb, Zap, BookOpen, ArrowLeft, RotateCcw } from 'lucide-react';

interface ResultsPageProps {
  attemptId: string;
  onRetake: () => void;
  onBack: () => void;
  onPractice: (subject: string, topic: string) => void;
}

export default function ResultsPage({ attemptId, onRetake, onBack, onPractice }: ResultsPageProps) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [attemptQs, setAttemptQs] = useState<AttemptQuestion[]>([]);
  const [paper, setPaper] = useState<Paper | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const attempts = await getAttempts();
      const a = attempts.find(at => at.id === attemptId);
      if (a) {
        setAttempt(a);
        const qs = await getAttemptQuestions(a.id);
        setAttemptQs(qs);
        const p = await getPaperById(a.paper_id);
        setPaper(p);
      }
    }
    load();
  }, [attemptId]);

  if (!attempt || !paper) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-gray-500 dark:text-gray-400">Loading results...</p>
      </div>
    );
  }

  const questions = paper.raw_json.questions;
  const subjectPerf = calculateSubjectPerformance(questions, attemptQs);
  const topicPerf = calculateTopicPerformance(questions, attemptQs);
  const pct = Math.round((attempt.score / attempt.total_marks) * 100);

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Library
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-3">
          <Trophy size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Exam Complete!</h1>
        <p className="text-gray-500 dark:text-gray-400">{attempt.paper_title}</p>
      </div>

      {/* Score Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold mb-1 ${getAccuracyColor(pct)}`}>{attempt.score}/{attempt.total_marks}</div>
          <div className={`text-2xl font-semibold ${getAccuracyColor(pct)}`}>{pct}%</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Accuracy: {attempt.accuracy}%</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
            <div className="text-xl font-bold text-green-700 dark:text-green-400">{attempt.correct_count}</div>
            <div className="text-xs text-green-600 dark:text-green-500">Correct</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <XCircle size={20} className="mx-auto text-red-600 mb-1" />
            <div className="text-xl font-bold text-red-700 dark:text-red-400">{attempt.incorrect_count}</div>
            <div className="text-xs text-red-600 dark:text-red-500">Incorrect</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <MinusCircle size={20} className="mx-auto text-gray-500 mb-1" />
            <div className="text-xl font-bold text-gray-700 dark:text-gray-400">{attempt.unanswered_count}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Unanswered</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Clock size={20} className="mx-auto text-blue-600 mb-1" />
            <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{formatTime(attempt.time_spent_seconds)}</div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Time Used</div>
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      {subjectPerf.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" /> Performance by Subject
          </h2>
          <div className="space-y-3">
            {subjectPerf.map(sp => (
              <div key={sp.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sp.subject}</span>
                  <span className={`text-sm font-bold ${getAccuracyColor(sp.accuracy)}`}>{sp.accuracy}% ({sp.correct}/{sp.total})</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${sp.accuracy >= 70 ? 'bg-green-500' : sp.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${sp.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Performance */}
      {topicPerf.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" /> Performance by Topic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicPerf.sort((a, b) => a.accuracy - b.accuracy).map(tp => (
              <div key={tp.topic} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tp.topic}</span>
                  <span className={`text-sm font-bold ${getAccuracyColor(tp.accuracy)}`}>{tp.accuracy}%</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tp.subject} • {tp.correct}/{tp.total} correct • Avg {tp.avgTime}s</p>
                {tp.accuracy < 60 && (
                  <button onClick={() => onPractice(tp.subject, tp.topic)} className="mt-2 text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                    Practice this topic →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <button onClick={() => setShowDetail(!showDetail)} className="w-full flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" /> Question Analysis
          </h2>
          <span className="text-sm text-indigo-600 dark:text-indigo-400">{showDetail ? 'Hide' : 'Show'} details</span>
        </button>

        {showDetail && (
          <div className="space-y-3">
            {attemptQs.map((aq, idx) => {
              const q = questions[aq.question_index];
              if (!q) return null;
              const isExpanded = expandedQ === idx;

              return (
                <div key={idx} className={`p-4 rounded-xl border-2 ${
                  aq.is_correct === true ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' :
                  aq.is_correct === false ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' :
                  'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}>
                  <button onClick={() => setExpandedQ(isExpanded ? null : idx)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 shrink-0">{idx + 1}</span>
                        <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{q.question}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500">{formatTime(aq.time_spent_seconds)}</span>
                        {aq.is_correct === true && <CheckCircle size={16} className="text-green-600" />}
                        {aq.is_correct === false && <XCircle size={16} className="text-red-600" />}
                        {aq.is_correct === null && <MinusCircle size={16} className="text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1 ml-8">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{q.subject} • {q.topic}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 ml-8 space-y-2 text-sm">
                      <div className="flex gap-4">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Your answer: </span>
                          <span className={aq.is_correct ? 'text-green-700 dark:text-green-400 font-medium' : 'text-red-700 dark:text-red-400 font-medium'}>
                            {aq.selected_answer !== null ? `${String.fromCharCode(65 + aq.selected_answer)}) ${q.options[aq.selected_answer]}` : 'Not attempted'}
                          </span>
                        </div>
                      </div>
                      {aq.is_correct !== true && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Correct answer: </span>
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            {String.fromCharCode(65 + q.answerIndex)}) {q.options[q.answerIndex]}
                          </span>
                        </div>
                      )}
                      {q.hint && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1"><Lightbulb size={12} /> Hint: {q.hint}</p>
                        </div>
                      )}
                      {q.solution && (
                        <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                          <p className="text-xs text-green-700 dark:text-green-400 whitespace-pre-wrap"><strong>Solution:</strong> {q.solution}</p>
                        </div>
                      )}
                      {q.shortcut && (
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                          <p className="text-xs text-purple-700 dark:text-purple-400 flex items-start gap-1"><Zap size={12} className="shrink-0 mt-0.5" /> Shortcut: {q.shortcut}</p>
                        </div>
                      )}
                      {q.learningSuggestion && (
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                          <p className="text-xs text-orange-700 dark:text-orange-400"><strong>📌 Learn:</strong> {q.learningSuggestion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onRetake} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
          <RotateCcw size={18} /> Retake Test
        </button>
        <button onClick={onBack} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          Back to Library
        </button>
      </div>
    </div>
  );
}
