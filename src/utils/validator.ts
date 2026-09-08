import { TestPaper, Question, QuestionType } from '../types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  paper?: TestPaper;
}

const VALID_TYPES: QuestionType[] = ['single_choice', 'multiple_choice', 'true_false'];

export function validatePaperJSON(jsonString: string): ValidationResult {
  const errors: string[] = [];

  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { valid: false, errors: ['Invalid JSON format. Please check your syntax.'] };
  }

  // Validate top-level fields
  if (!data.paperName || typeof data.paperName !== 'string') {
    errors.push('Missing or invalid "paperName" (must be a non-empty string).');
  }

  if (!data.duration || typeof data.duration !== 'number' || data.duration <= 0) {
    errors.push('Missing or invalid "duration" (must be a positive number in minutes).');
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('Missing or empty "questions" array. At least one question is required.');
    return { valid: false, errors };
  }

  if (typeof data.negativeMarking !== 'number' || data.negativeMarking < 0) {
    errors.push('Missing or invalid "negativeMarking" (must be a non-negative number).');
  }

  // Validate each question
  const questionIds = new Set<string>();
  data.questions.forEach((q: any, index: number) => {
    const prefix = `Question ${index + 1}`;

    if (!q.id || typeof q.id !== 'string') {
      errors.push(`${prefix}: Missing or invalid "id".`);
    } else if (questionIds.has(q.id)) {
      errors.push(`${prefix}: Duplicate question id "${q.id}".`);
    } else {
      questionIds.add(q.id);
    }

    if (!q.questionText || typeof q.questionText !== 'string') {
      errors.push(`${prefix}: Missing or invalid "questionText".`);
    }

    if (!q.questionType || !VALID_TYPES.includes(q.questionType)) {
      errors.push(`${prefix}: Invalid "questionType". Must be one of: ${VALID_TYPES.join(', ')}.`);
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`${prefix}: "options" must be an array with at least 2 items.`);
    } else {
      q.options.forEach((opt: any, optIdx: number) => {
        if (!opt.id || typeof opt.id !== 'string') {
          errors.push(`${prefix}, Option ${optIdx + 1}: Missing or invalid "id".`);
        }
        if (!opt.text || typeof opt.text !== 'string') {
          errors.push(`${prefix}, Option ${optIdx + 1}: Missing or invalid "text".`);
        }
      });
    }

    if (q.questionType === 'multiple_choice') {
      if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
        errors.push(`${prefix}: "correctAnswer" must be a non-empty array for multiple_choice questions.`);
      }
    } else {
      if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
        errors.push(`${prefix}: "correctAnswer" must be a string for ${q.questionType || 'single_choice/true_false'} questions.`);
      }
    }

    if (typeof q.marks !== 'number' || q.marks <= 0) {
      errors.push(`${prefix}: "marks" must be a positive number.`);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Build the paper object
  const totalMarks = data.questions.reduce((sum: number, q: Question) => sum + q.marks, 0);
  const paper: TestPaper = {
    paperName: data.paperName,
    description: data.description || '',
    duration: data.duration,
    totalQuestions: data.questions.length,
    totalMarks,
    negativeMarking: data.negativeMarking || 0,
    questions: data.questions,
    createdAt: new Date().toISOString(),
  };

  return { valid: true, errors: [], paper };
}
