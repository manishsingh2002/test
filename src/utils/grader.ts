import { QuestionJSON, Attempt, AttemptQuestion, PaperJSON, SubjectPerformance, TopicPerformance } from '../types';

export function gradeQuestions(
  questions: QuestionJSON[],
  answers: Record<number, number | null>,
  negativeMarking: number
): { questions: AttemptQuestion[]; score: number; correct: number; incorrect: number; unanswered: number } {
  let score = 0;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  const graded: AttemptQuestion[] = questions.map((q, idx) => {
    const selectedAnswer = answers[idx] ?? null;
    const isAnswered = selectedAnswer !== null;

    if (!isAnswered) {
      unanswered++;
      return {
        id: '',
        attempt_id: '',
        question_id: q.id,
        question_index: idx,
        selected_answer: null,
        is_correct: null,
        time_spent_seconds: 0,
        marked_for_review: false,
        is_answered: false,
      };
    }

    const isCorrect = selectedAnswer === q.answerIndex;
    if (isCorrect) {
      correct++;
      score += q.marks;
    } else {
      incorrect++;
      score -= (q.negativeMarks ?? negativeMarking);
    }

    return {
      id: '',
      attempt_id: '',
      question_id: q.id,
      question_index: idx,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent_seconds: 0,
      marked_for_review: false,
      is_answered: true,
    };
  });

  return { questions: graded, score: Math.max(0, score), correct, incorrect, unanswered };
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateSubjectPerformance(
  questions: QuestionJSON[],
  attemptQuestions: AttemptQuestion[]
): SubjectPerformance[] {
  const subjectMap = new Map<string, { total: number; correct: number; totalTime: number }>();

  attemptQuestions.forEach((aq) => {
    const q = questions.find(qq => String(qq.id) === String(aq.question_id));
    if (!q) return;
    const subject = q.subject || 'Unknown';
    const existing = subjectMap.get(subject) || { total: 0, correct: 0, totalTime: 0 };
    existing.total++;
    if (aq.is_correct) existing.correct++;
    existing.totalTime += aq.time_spent_seconds;
    subjectMap.set(subject, existing);
  });

  return Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    total: data.total,
    correct: data.correct,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    avgTime: data.total > 0 ? Math.round(data.totalTime / data.total) : 0,
  }));
}

export function calculateTopicPerformance(
  questions: QuestionJSON[],
  attemptQuestions: AttemptQuestion[]
): TopicPerformance[] {
  const topicMap = new Map<string, { subject: string; total: number; correct: number; totalTime: number }>();

  attemptQuestions.forEach((aq) => {
    const q = questions.find(qq => String(qq.id) === String(aq.question_id));
    if (!q) return;
    const topic = q.topic || 'Unknown';
    const existing = topicMap.get(topic) || { subject: q.subject || 'Unknown', total: 0, correct: 0, totalTime: 0 };
    existing.total++;
    if (aq.is_correct) existing.correct++;
    existing.totalTime += aq.time_spent_seconds;
    topicMap.set(topic, existing);
  });

  return Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    subject: data.subject,
    total: data.total,
    correct: data.correct,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    avgTime: data.total > 0 ? Math.round(data.totalTime / data.total) : 0,
  }));
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'text-green-600 dark:text-green-400';
  if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (accuracy >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

export function getScoreColor(score: number, total: number): string {
  const pct = (score / total) * 100;
  return getAccuracyColor(pct);
}
