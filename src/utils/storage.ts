import { TestPaper, TestAttempt, TimerState } from '../types';

const PAPERS_KEY = 'mock_test_papers';
const ATTEMPTS_KEY = 'mock_test_attempts';
const TIMER_KEY = 'mock_test_timer';
const ANSWERS_KEY = 'mock_test_answers';
const REVIEW_KEY = 'mock_test_review';

export function getPapers(): TestPaper[] {
  const data = localStorage.getItem(PAPERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePaper(paper: TestPaper): void {
  const papers = getPapers();
  const existingIndex = papers.findIndex(p => p.paperName === paper.paperName);
  if (existingIndex >= 0) {
    papers[existingIndex] = paper;
  } else {
    papers.push(paper);
  }
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
}

export function deletePaper(paperName: string): void {
  const papers = getPapers().filter(p => p.paperName !== paperName);
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
}

export function getPaper(paperName: string): TestPaper | undefined {
  return getPapers().find(p => p.paperName === paperName);
}

export function getAttempts(): TestAttempt[] {
  const data = localStorage.getItem(ATTEMPTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAttempt(attempt: TestAttempt): void {
  const attempts = getAttempts();
  attempts.push(attempt);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
}

export function getAttemptsByPaper(paperName: string): TestAttempt[] {
  return getAttempts().filter(a => a.paperName === paperName);
}

export function getTimerState(): TimerState | null {
  const data = localStorage.getItem(TIMER_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveTimerState(state: TimerState): void {
  localStorage.setItem(TIMER_KEY, JSON.stringify(state));
}

export function clearTimerState(): void {
  localStorage.removeItem(TIMER_KEY);
}

export function getSavedAnswers(paperName: string): Record<string, string | string[] | null> {
  const data = localStorage.getItem(`${ANSWERS_KEY}_${paperName}`);
  return data ? JSON.parse(data) : {};
}

export function saveAnswers(paperName: string, answers: Record<string, string | string[] | null>): void {
  localStorage.setItem(`${ANSWERS_KEY}_${paperName}`, JSON.stringify(answers));
}

export function clearAnswers(paperName: string): void {
  localStorage.removeItem(`${ANSWERS_KEY}_${paperName}`);
}

export function getSavedReview(paperName: string): Record<string, boolean> {
  const data = localStorage.getItem(`${REVIEW_KEY}_${paperName}`);
  return data ? JSON.parse(data) : {};
}

export function saveReview(paperName: string, review: Record<string, boolean>): void {
  localStorage.setItem(`${REVIEW_KEY}_${paperName}`, JSON.stringify(review));
}

export function clearReview(paperName: string): void {
  localStorage.removeItem(`${REVIEW_KEY}_${paperName}`);
}
