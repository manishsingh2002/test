import { useState, useEffect, useCallback, useRef } from 'react';
import { TestPaper, UserAnswers, MarkedForReview } from '../types';
import { getPaper, saveTimerState, clearTimerState, getTimerState, saveAnswers, getSavedAnswers, saveReview, getSavedReview, clearAnswers, clearReview, saveAttempt } from '../utils/storage';
import { gradeTest, formatTime, getTimeTakenString } from '../utils/grader';
import { Clock, ChevronLeft, ChevronRight, Flag, Eraser, Send, AlertTriangle } from 'lucide-react';

interface TestRunnerProps {
  paperName: string;
  onSubmit: (attemptId: string) => void;
  onExit: () => void;
}

export default function TestRunner({ paperName, onSubmit, onExit }: TestRunnerProps) {
  const [paper, setPaper] = useState<TestPaper | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [markedForReview, setMarkedForReview] = useState<MarkedForReview>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef(0);

  // Initialize
  useEffect(() => {
    const p = getPaper(paperName);
    if (!p) {
      onExit();
      return;
    }
    setPaper(p);

    // Check for existing timer (resume after refresh)
    const savedTimer = getTimerState();
    const savedAnswers = getSavedAnswers(paperName);
    const savedReview = getSavedReview(paperName);

    let start: number;
    if (savedTimer && savedTimer.paperName === paperName) {
      start = savedTimer.startTime;
    } else {
      start = Date.now();
      saveTimerState({ startTime: start, duration: p.duration, paperName });
    }

    startTimeRef.current = start;
    setStartTime(start);
    setAnswers(savedAnswers);
    setMarkedForReview(savedReview);

    // Calculate remaining time
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const totalSeconds = p.duration * 60;
    const remaining = Math.max(0, totalSeconds - elapsed);
    setTimeLeft(remaining);
  }, [paperName, onExit]);

  // Timer countdown
  useEffect(() => {
    if (!paper || isSubmitting) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const totalSeconds = paper.duration * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paper, isSubmitting]);

  // Save answers periodically
  useEffect(() => {
    if (paperName) {
      saveAnswers(paperName, answers);
    }
  }, [answers, paperName]);

  useEffect(() => {
    if (paperName) {
      saveReview(paperName, markedForReview);
    }
  }, [markedForReview, paperName]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMultipleChoice = (questionId: string, optionId: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter(id => id !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const handleToggleReview = () => {
    const qId = paper!.questions[currentQuestion].id;
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleClearResponse = () => {
    const qId = paper!.questions[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [qId]: null }));
  };

  const handleSubmit = useCallback((autoSubmit = false) => {
    if (!paper) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    const endTime = Date.now();
    const timeTaken = getTimeTakenString(startTimeRef.current, endTime);

    const attempt = gradeTest(paper, answers, timeTaken);
    saveAttempt(attempt);

    // Cleanup
    clearTimerState();
    clearAnswers(paperName);
    clearReview(paperName);

    if (autoSubmit) {
      onSubmit(attempt.id);
    } else {
      onSubmit(attempt.id);
    }
  }, [paper, answers, paperName, onSubmit, isSubmitting]);

  const getQuestionStatus = (index: number): 'answered' | 'marked' | 'unanswered' | 'not_visited' => {
    if (!paper) return 'not_visited';
    const qId = paper.questions[index].id;
    if (markedForReview[qId]) return 'marked';
    if (answers[qId] !== undefined && answers[qId] !== null) {
      if (Array.isArray(answers[qId]) && (answers[qId] as string[]).length === 0) return 'unanswered';
      return 'answered';
    }
    if (index <= currentQuestion) return 'unanswered';
    return 'not_visited';
  };

  if (!paper) return null;

  const question = paper.questions[currentQuestion];
  const isTimerWarning = timeLeft < 300; // Less than 5 minutes
  const isTimerCritical = timeLeft < 60; // Less than 1 minute

  const getStatusCounts = () => {
    let answered = 0, marked = 0, unanswered = 0, notVisited = 0;
    paper.questions.forEach((_, idx) => {
      const status = getQuestionStatus(idx);
      if (status === 'answered') answered++;
      else if (status === 'marked') marked++;
      else if (status === 'unanswered') unanswered++;
      else notVisited++;
    });
    return { answered, marked, unanswered, notVisited };
  };

  const counts = getStatusCounts();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Timer */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 mb-6 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {paper.paperName}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Question {currentQuestion + 1} of {paper.totalQuestions}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${
              isTimerCritical ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' :
              isTimerWarning ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
              'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send size={18} />
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Question Area */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-4">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold">
                  {currentQuestion + 1}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Marks: {question.marks} | Type: {question.questionType.replace('_', ' ')}
                </span>
              </div>
              {markedForReview[question.id] && (
                <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
                  <Flag size={12} />
                  Marked for Review
                </span>
              )}
            </div>

            {/* Question Text */}
            <p className="text-lg text-gray-900 dark:text-white mb-6 leading-relaxed">
              {question.questionText}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = question.questionType === 'multiple_choice'
                  ? ((answers[question.id] as string[]) || []).includes(option.id)
                  : answers[question.id] === option.id;

                return (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {question.questionType === 'multiple_choice' ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMultipleChoice(question.id, option.id)}
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    ) : (
                      <input
                        type="radio"
                        name={question.id}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(question.id, option.id)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                    )}
                    <span className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                        {option.id}
                      </span>
                      <span className="text-gray-900 dark:text-white">{option.text}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(paper.totalQuestions - 1, prev + 1))}
                disabled={currentQuestion === paper.totalQuestions - 1}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleToggleReview}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  markedForReview[question.id]
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Flag size={16} />
                {markedForReview[question.id] ? 'Unmark Review' : 'Mark for Review'}
              </button>
              <button
                onClick={handleClearResponse}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Eraser size={16} />
                Clear Response
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="lg:w-72">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Question Palette</h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-green-500"></span>
                <span className="text-gray-600 dark:text-gray-400">Answered ({counts.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-orange-500"></span>
                <span className="text-gray-600 dark:text-gray-400">Review ({counts.marked})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-red-500"></span>
                <span className="text-gray-600 dark:text-gray-400">Not Answered ({counts.unanswered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-gray-300 dark:bg-gray-600"></span>
                <span className="text-gray-600 dark:text-gray-400">Not Visited ({counts.notVisited})</span>
              </div>
            </div>

            {/* Question Numbers Grid */}
            <div className="grid grid-cols-5 gap-2">
              {paper.questions.map((q, idx) => {
                const status = getQuestionStatus(idx);
                const isCurrent = idx === currentQuestion;
                let bgColor = 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
                if (status === 'answered') bgColor = 'bg-green-500 text-white';
                else if (status === 'marked') bgColor = 'bg-orange-500 text-white';
                else if (status === 'unanswered') bgColor = 'bg-red-500 text-white';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-medium text-sm flex items-center justify-center transition-all ${bgColor} ${
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Submit Test?
              </h3>
            </div>
            <div className="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex justify-between">
                <span>Answered:</span>
                <span className="font-medium text-green-600">{counts.answered}</span>
              </p>
              <p className="flex justify-between">
                <span>Marked for Review:</span>
                <span className="font-medium text-orange-600">{counts.marked}</span>
              </p>
              <p className="flex justify-between">
                <span>Not Answered:</span>
                <span className="font-medium text-red-600">{counts.unanswered}</span>
              </p>
              <p className="flex justify-between">
                <span>Not Visited:</span>
                <span className="font-medium text-gray-600">{counts.notVisited}</span>
              </p>
              <hr className="border-gray-200 dark:border-gray-700" />
              <p className="flex justify-between font-semibold text-gray-900 dark:text-white">
                <span>Total Questions:</span>
                <span>{paper.totalQuestions}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
