import { PaperJSON, QuestionJSON, ValidationResult, ValidationError, Difficulty } from '../types';

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export function validatePaperJSON(jsonString: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return {
      valid: false,
      errors: [{ path: 'root', message: `Invalid JSON syntax: ${(e as Error).message}`, severity: 'error' }],
      warnings: [],
      questionCount: 0,
      totalMarks: 0,
      subjects: [],
      duration: 0,
    };
  }

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ path: 'root', message: 'JSON must be an object.', severity: 'error' }],
      warnings: [],
      questionCount: 0, totalMarks: 0, subjects: [], duration: 0,
    };
  }

  const paper = data as Record<string, unknown>;

  // Validate paper-level fields
  if (!paper.paperTitle || typeof paper.paperTitle !== 'string') {
    errors.push({ path: 'paperTitle', message: 'Missing or invalid "paperTitle" (must be a non-empty string).', severity: 'error' });
  }

  if (!paper.durationMinutes || typeof paper.durationMinutes !== 'number' || paper.durationMinutes <= 0) {
    errors.push({ path: 'durationMinutes', message: 'Missing or invalid "durationMinutes" (must be a positive number).', severity: 'error' });
  }

  if (!paper.totalMarks || typeof paper.totalMarks !== 'number' || paper.totalMarks <= 0) {
    warnings.push({ path: 'totalMarks', message: '"totalMarks" is missing or invalid. It will be calculated from questions.', severity: 'warning' });
  }

  if (paper.negativeMarking !== undefined && (typeof paper.negativeMarking !== 'number' || paper.negativeMarking < 0)) {
    warnings.push({ path: 'negativeMarking', message: '"negativeMarking" should be a non-negative number.', severity: 'warning' });
  }

  if (!paper.questions || !Array.isArray(paper.questions)) {
    return {
      valid: false,
      errors: [{ path: 'questions', message: 'Missing or invalid "questions" array.', severity: 'error' }],
      warnings, questionCount: 0, totalMarks: 0, subjects: [], duration: 0,
    };
  }

  if (paper.questions.length === 0) {
    errors.push({ path: 'questions', message: 'Questions array is empty. At least one question is required.', severity: 'error' });
  }

  // Validate each question
  const questionIds = new Set<string | number>();
  const subjects = new Set<string>();
  let totalMarks = 0;

  (paper.questions as unknown[]).forEach((q: unknown, index: number) => {
    const prefix = `Question ${index + 1}`;
    if (!q || typeof q !== 'object') {
      errors.push({ path: `questions[${index}]`, message: `${prefix}: Must be an object.`, severity: 'error' });
      return;
    }

    const question = q as Record<string, unknown>;

    // ID
    if (question.id === undefined || question.id === null) {
      errors.push({ path: `questions[${index}].id`, message: `${prefix}: Missing "id" field.`, severity: 'error' });
    } else if (questionIds.has(question.id as string | number)) {
      errors.push({ path: `questions[${index}].id`, message: `${prefix}: Duplicate question id "${question.id}".`, severity: 'error' });
    } else {
      questionIds.add(question.id as string | number);
    }

    // Question text
    if (!question.question || typeof question.question !== 'string' || (question.question as string).trim() === '') {
      errors.push({ path: `questions[${index}].question`, message: `${prefix}: Missing or empty "question" text.`, severity: 'error' });
    }

    // Subject
    if (!question.subject || typeof question.subject !== 'string') {
      warnings.push({ path: `questions[${index}].subject`, message: `${prefix}: Missing "subject" field.`, severity: 'warning' });
    } else {
      subjects.add(question.subject as string);
    }

    // Topic
    if (!question.topic || typeof question.topic !== 'string') {
      warnings.push({ path: `questions[${index}].topic`, message: `${prefix}: Missing "topic" field.`, severity: 'warning' });
    }

    // Options
    if (!Array.isArray(question.options) || question.options.length < 2) {
      errors.push({ path: `questions[${index}].options`, message: `${prefix}: "options" must be an array with at least 2 items.`, severity: 'error' });
    } else {
      (question.options as unknown[]).forEach((opt, optIdx) => {
        if (typeof opt !== 'string' || (opt as string).trim() === '') {
          errors.push({ path: `questions[${index}].options[${optIdx}]`, message: `${prefix}, Option ${String.fromCharCode(65 + optIdx)}: Must be a non-empty string.`, severity: 'error' });
        }
      });
    }

    // Correct answer
    if (question.correctAnswer === undefined || question.correctAnswer === null) {
      errors.push({ path: `questions[${index}].correctAnswer`, message: `${prefix}: Missing "correctAnswer".`, severity: 'error' });
    } else if (typeof question.correctAnswer !== 'string') {
      errors.push({ path: `questions[${index}].correctAnswer`, message: `${prefix}: "correctAnswer" must be a string matching one of the options.`, severity: 'error' });
    } else if (Array.isArray(question.options)) {
      const optionValues = question.options as string[];
      if (!optionValues.includes(question.correctAnswer as string)) {
        errors.push({
          path: `questions[${index}].correctAnswer`,
          message: `${prefix}: "correctAnswer" value "${question.correctAnswer}" does not match any option. Available: ${optionValues.join(', ')}`,
          severity: 'error',
        });
      }
    }

    // Answer index
    if (question.answerIndex === undefined || question.answerIndex === null) {
      errors.push({ path: `questions[${index}].answerIndex`, message: `${prefix}: Missing "answerIndex".`, severity: 'error' });
    } else if (typeof question.answerIndex !== 'number') {
      errors.push({ path: `questions[${index}].answerIndex`, message: `${prefix}: "answerIndex" must be a number.`, severity: 'error' });
    } else if (Array.isArray(question.options)) {
      const maxIdx = (question.options as unknown[]).length - 1;
      if ((question.answerIndex as number) < 0 || (question.answerIndex as number) > maxIdx) {
        errors.push({ path: `questions[${index}].answerIndex`, message: `${prefix}: "answerIndex" ${question.answerIndex} is out of range (0-${maxIdx}).`, severity: 'error' });
      }
      // Verify answerIndex matches correctAnswer
      if (typeof question.correctAnswer === 'string' && Array.isArray(question.options)) {
        const opts = question.options as string[];
        if (opts[question.answerIndex as number] !== question.correctAnswer) {
          errors.push({
            path: `questions[${index}].answerIndex`,
            message: `${prefix}: "answerIndex" (${question.answerIndex} → "${opts[question.answerIndex as number]}") does not match "correctAnswer" ("${question.correctAnswer}").`,
            severity: 'error',
          });
        }
      }
    }

    // Marks
    if (question.marks === undefined || typeof question.marks !== 'number' || (question.marks as number) <= 0) {
      errors.push({ path: `questions[${index}].marks`, message: `${prefix}: "marks" must be a positive number.`, severity: 'error' });
    } else {
      totalMarks += question.marks as number;
    }

    // Difficulty
    if (question.difficulty && !VALID_DIFFICULTIES.includes(question.difficulty as Difficulty)) {
      warnings.push({ path: `questions[${index}].difficulty`, message: `${prefix}: Invalid difficulty "${question.difficulty}". Should be easy/medium/hard.`, severity: 'warning' });
    }

    // Negative marks
    if (question.negativeMarks !== undefined && (typeof question.negativeMarks !== 'number' || (question.negativeMarks as number) < 0)) {
      warnings.push({ path: `questions[${index}].negativeMarks`, message: `${prefix}: "negativeMarks" should be a non-negative number.`, severity: 'warning' });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    questionCount: (paper.questions as unknown[]).length,
    totalMarks,
    subjects: Array.from(subjects),
    duration: (paper.durationMinutes as number) || 0,
  };
}

export function parsePaperJSON(jsonString: string): PaperJSON | null {
  try {
    const data = JSON.parse(jsonString) as PaperJSON;
    return data;
  } catch {
    return null;
  }
}
