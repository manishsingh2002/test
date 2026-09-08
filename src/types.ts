export interface Option {
  id: string;
  text: string;
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'true_false';

export interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: Option[];
  correctAnswer: string | string[];
  marks: number;
}

export interface TestPaper {
  paperName: string;
  description: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: number;
  questions: Question[];
  createdAt: string;
}

export interface QuestionResult {
  id: string;
  userAnswer: string | string[] | null;
  correctAnswer: string | string[];
  status: 'correct' | 'wrong' | 'skipped';
  marksAwarded: number;
  markedForReview: boolean;
}

export interface TestAttempt {
  id: string;
  paperName: string;
  attemptedOn: string;
  timeTaken: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  totalMarks: number;
  percentage: number;
  questionWiseResult: QuestionResult[];
}

export type UserAnswers = Record<string, string | string[] | null>;
export type MarkedForReview = Record<string, boolean>;

export interface TimerState {
  startTime: number;
  duration: number;
  paperName: string;
}
