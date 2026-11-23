import type { LessonFormat } from "./lessons";

export type LessonAttempt = {
  id: string;
  lessonId: string;
  title: string;
  topic: string;
  format: LessonFormat;
  level: string;
  score: number;
  total: number;
  points: number;
  completedAt: string;
};

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function getStreak(attempts: LessonAttempt[]) {
  if (!attempts.length) return 0;
  const days = new Set(attempts.map((attempt) => dayKey(new Date(attempt.completedAt))));
  const cursor = new Date();
  // Если сегодня ещё не занимались, серия может продолжаться со вчерашнего дня.
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// --- Черновики незавершённых занятий ---
const DRAFT_PREFIX = "ch2-lesson-draft:";

export const draftKeyFor = (lessonId: string) => `${DRAFT_PREFIX}${lessonId}`;

export type LessonDraftInfo = {
  index: number;
  total?: number;
};

export function getDraftInfo(lessonId: string): LessonDraftInfo | null {
  try {
    const raw = localStorage.getItem(draftKeyFor(lessonId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as { index?: number; finished?: boolean };
    if (draft.finished || !draft.index || draft.index <= 0) return null;
    return { index: draft.index };
  } catch {
    return null;
  }
}

export function getWeekActivity(attempts: LessonAttempt[]) {
  const result = Array.from({ length: 7 }, () => 0);
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  attempts.forEach((attempt) => {
    const date = new Date(attempt.completedAt);
    const index = Math.floor((date.getTime() - monday.getTime()) / 86_400_000);
    if (index >= 0 && index < 7) result[index] = Math.min(100, result[index] + 24);
  });
  return result;
}