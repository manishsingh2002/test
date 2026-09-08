import { TestPaper, UserAnswers, QuestionResult, TestAttempt } from '../types';

export function gradeTest(paper: TestPaper, userAnswers: UserAnswers, timeTaken: string): TestAttempt {
  const questionWiseResult: QuestionResult[] = [];
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let score = 0;

  paper.questions.forEach((question) => {
    const userAnswer = userAnswers[question.id] ?? null;
    let status: 'correct' | 'wrong' | 'skipped';
    let marksAwarded = 0;

    if (userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      status = 'skipped';
      skipped++;
    } else if (question.questionType === 'multiple_choice') {
      const correctAnswers = (question.correctAnswer as string[]).sort();
      const userAnswersSorted = (userAnswer as string[]).sort();

      const isExactMatch =
        correctAnswers.length === userAnswersSorted.length &&
        correctAnswers.every((ans, idx) => ans === userAnswersSorted[idx]);

      if (isExactMatch) {
        status = 'correct';
        marksAwarded = question.marks;
        correct++;
      } else {
        status = 'wrong';
        marksAwarded = -paper.negativeMarking;
        wrong++;
      }
    } else {
      // single_choice or true_false
      if (userAnswer === question.correctAnswer) {
        status = 'correct';
        marksAwarded = question.marks;
        correct++;
      } else {
        status = 'wrong';
        marksAwarded = -paper.negativeMarking;
        wrong++;
      }
    }

    score += marksAwarded;

    questionWiseResult.push({
      id: question.id,
      userAnswer,
      correctAnswer: question.correctAnswer,
      status,
      marksAwarded,
      markedForReview: false,
    });
  });

  const attempted = correct + wrong;
  const percentage = Math.round((score / paper.totalMarks) * 100);

  return {
    id: `attempt_${Date.now()}`,
    paperName: paper.paperName,
    attemptedOn: new Date().toISOString(),
    timeTaken,
    totalQuestions: paper.totalQuestions,
    attempted,
    correct,
    wrong,
    skipped,
    score: Math.max(0, score),
    totalMarks: paper.totalMarks,
    percentage: Math.max(0, percentage),
    questionWiseResult,
  };
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getTimeTakenString(startTime: number, endTime: number): string {
  const diff = Math.floor((endTime - startTime) / 1000);
  return formatTime(diff);
}
