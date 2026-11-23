import { LESSONS, type Lesson, type LessonFormat } from "./lessons";

export type Role = "admin" | "student";

export type Student = {
  id: string;
  name: string;
  email: string;
  password?: string;
  initials: string;
  cls: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  progress: number;
  streak: number;
  words: number;
  color: string;
};

export type Assignment = {
  id: string;
  title: string;
  topic: string;
  format: LessonFormat;
  code: string;
  done: number;
  total: number;
  deadline: string;
  status: "active" | "done";
  contentId?: string;
  level?: string;
  duration?: number;
  itemCount?: number;
  description?: string;
  source?: string;
  customLesson?: Lesson;
};

// Дефолтные данные для теста
export const ADMIN = {
  name: "Преподаватель",
  email: "admin@chistovik.app",
  password: "english2026",
};

export const STUDENTS: Student[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = LESSONS.map((lesson, index) => ({
  id: lesson.id,
  contentId: lesson.id,
  title: lesson.title,
  topic: lesson.topic,
  format: lesson.format,
  code: lesson.code,
  done: 0,
  total: 28,
  deadline: index < 4 ? "до конца недели" : "без срока",
  status: "active",
  level: lesson.level,
  duration: lesson.duration,
  itemCount: lesson.questions.length,
  description: lesson.description,
  source: lesson.source,
}));

export const CODE_WORDS = ["CLOUD", "RIVER", "LIGHT", "BRIDGE", "NORTH", "WATER", "STONE", "FIELD", "MAPLE", "STORM"];
