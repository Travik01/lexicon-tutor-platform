import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Award,
  LayoutDashboard,
  Library,
  LogOut,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "../../components/Header";
import { LESSON_BY_ID, type Lesson, PROGRAM_SETS, type Set } from "../../data/lessons";
import type { LessonAttempt } from "../../data/progress";
import { ADMIN, INITIAL_ASSIGNMENTS, STUDENTS as INITIAL_STUDENTS, type Student, type Assignment, type Role } from "../../data/mock";
import Bell from "./Bell";
import Overview from "./Overview";
import StudentsView from "./StudentsView";
import AssignmentPlayer, { type LessonResult } from "./AssignmentPlayer";
import { type SavedLessonResult } from "./AssignmentsView";
import SettingsView from "./SettingsView";
import StudentHome from "./StudentHome";
import AssignmentsHub from "./AssignmentsHub";
import ProgressView from "./ProgressView";
import ProgramView from "./ProgramView";
import MascotToast, { type Toast } from "./MascotToast";
import LexisLab from "./LexisLab";
import GuestOnboarding, {
  GOAL_LABELS,
  PROFILE_KEY,
  type GuestProfile,
} from "./GuestOnboarding";

type Tab = "overview" | "students" | "assignments" | "settings" | "home" | "progress" | "program" | "lexis";

const ASSIGN_KEY = "ch2-assignments";
const RESULTS_KEY = "ch2-lesson-results";
const POINTS_KEY = "ch2-points";
const AUTOPLAY_KEY = "ch2-autoplay-quiz";
const ATTEMPTS_KEY = "ch2-lesson-attempts";
const STUDENTS_KEY = "ch2-students";
const CUSTOM_VOCAB_KEY = "ch2-custom-vocab";
const PROGRAM_KEY = "ch2-program-sets";

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function loadAssignments(): Assignment[] {
  const stored = readLocal<Assignment[]>(ASSIGN_KEY, []);
  const storedById = new Map(stored.map((assignment) => [assignment.id, assignment]));
  const libraryIds = new Set(INITIAL_ASSIGNMENTS.map((assignment) => assignment.id));

  const library = INITIAL_ASSIGNMENTS.map((assignment) => ({
    ...assignment,
    ...(storedById.get(assignment.id) ?? {}),
    contentId: assignment.contentId,
    level: assignment.level,
    duration: assignment.duration,
    itemCount: assignment.itemCount,
    description: assignment.description,
    source: assignment.source,
  }));
  const custom = stored.filter(
    (assignment) => !libraryIds.has(assignment.id) && assignment.id.startsWith("new-")
  );
  return [...custom, ...library];
}

const ADMIN_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Главная", icon: LayoutDashboard },
  { id: "program", label: "Программа", icon: Calendar },
  { id: "students", label: "Группы", icon: Users },
  { id: "assignments", label: "Контент", icon: Library },
  { id: "settings", label: "Настройки", icon: Settings },
];

const GUEST_TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Мой прогресс", icon: LayoutDashboard },
  { id: "program", label: "Моя программа", icon: Calendar },
  { id: "lexis", label: "Lexis Lab", icon: BookOpen },
  { id: "assignments", label: "Библиотека", icon: ClipboardList },
  { id: "progress", label: "Мой путь", icon: Award },
];

export default function AppArea({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const isAdmin = role === "admin";
  const tabs = isAdmin ? ADMIN_TABS : GUEST_TABS;
  const [tab, setTab] = useState<Tab>(isAdmin ? "overview" : "home");
  const [assignments, setAssignments] = useState<Assignment[]>(loadAssignments);
  const [programSets, setProgramSets] = useState<Set[]>(() => readLocal(PROGRAM_KEY, PROGRAM_SETS));
  const [studentsList, setStudentsList] = useState<Student[]>(() => readLocal(STUDENTS_KEY, INITIAL_STUDENTS));
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(() =>
    readLocal(PROFILE_KEY, null)
  );
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (isAdmin || readLocal<GuestProfile | null>(PROFILE_KEY, null)) return false;
    return true;
  });

  useEffect(() => {
    if (!isAdmin && guestProfile && !studentsList.find(s => s.name === guestProfile.name)) {
      const initials = guestProfile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      const newStudent: Student = {
        id: `s-auto-${Date.now()}`,
        name: guestProfile.name,
        email: `${guestProfile.name.toLowerCase().replace(/\s+/g, ".")}@guest.app`,
        initials,
        cls: "Самообучение",
        level: guestProfile.level === "unknown" ? "B1" : guestProfile.level as Student["level"],
        progress: 0,
        streak: 0,
        words: 0,
        color: "bg-sky",
      };
      setStudentsList(curr => {
        const next = [newStudent, ...curr];
        writeLocal(STUDENTS_KEY, next);
        return next;
      });
    }
  }, [guestProfile, isAdmin, studentsList]);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(() => {
    try {
      const lessonId = localStorage.getItem(AUTOPLAY_KEY);
      localStorage.removeItem(AUTOPLAY_KEY);
      if (!lessonId) return null;
      return (
        LESSON_BY_ID[lessonId] ??
        loadAssignments().find((assignment) => assignment.id === lessonId)?.customLesson ??
        null
      );
    } catch {
      return null;
    }
  });
  const [lessonResults, setLessonResults] = useState<Record<string, SavedLessonResult>>(() =>
    readLocal(RESULTS_KEY, {})
  );
  const [attempts, setAttempts] = useState<LessonAttempt[]>(() =>
    readLocal(ATTEMPTS_KEY, [])
  );
  const [toast, setToast] = useState<Toast | null>(null);
  const [customVocabSets, setCustomVocabSets] = useState<import("../../data/vocabulary").LessonVocabSet[]>(() =>
    readLocal(CUSTOM_VOCAB_KEY, [])
  );

  const [teacherName, setTeacherName] = useState(() => readLocal("ch2-teacher-name", ADMIN.name));

  const effectiveName = isAdmin ? (teacherName || "Преподаватель") : (guestProfile?.name || "Ученик");
  const userInitials = effectiveName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "У";

  const user = isAdmin
    ? { name: effectiveName, roleLabel: "Преподаватель", initials: userInitials, color: "bg-accent" }
    : {
        name: effectiveName,
        roleLabel: guestProfile
          ? `${GOAL_LABELS[guestProfile.goal]} · ${guestProfile.level}`
          : "ученик",
        initials: userInitials,
        color: "bg-sky",
      };

  const saveGuestProfile = (profile: GuestProfile) => {
    setGuestProfile(profile);
    writeLocal(PROFILE_KEY, profile);
    setShowOnboarding(false);
  };

  const addAssignment = (a: Assignment) =>
    setAssignments((list) => {
      const next = [a, ...list];
      writeLocal(ASSIGN_KEY, next);
      return next;
    });

  const toggleAssignmentStatus = (assignmentId: string) =>
    setAssignments((current) => {
      const next = current.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status: assignment.status === "active" ? ("done" as const) : ("active" as const),
              deadline: assignment.status === "active" ? "завершено" : "без срока",
            }
          : assignment
      );
      writeLocal(ASSIGN_KEY, next);
      return next;
    });

  const deleteAssignment = (assignmentId: string) =>
    setAssignments((current) => {
      const next = current.filter((assignment) => assignment.id !== assignmentId);
      writeLocal(ASSIGN_KEY, next);
      return next;
    });

  const openAssignment = (assignment: Assignment) => {
    setSelectedLesson(
      assignment.customLesson ??
        LESSON_BY_ID[assignment.contentId ?? assignment.id] ??
        null
    );
  };

  const openLessonById = (lessonId: string) => {
    const lesson =
      LESSON_BY_ID[lessonId] ??
      assignments.find((assignment) => assignment.id === lessonId)?.customLesson;
    if (lesson) setSelectedLesson(lesson);
  };

  const completeLesson = (result: LessonResult) => {
    if (isAdmin) {
      setSelectedLesson(null);
      return;
    }

    const alreadyCompleted = Boolean(lessonResults[result.lessonId]);
    const completedLesson = selectedLesson ?? LESSON_BY_ID[result.lessonId];
    const saved: SavedLessonResult = {
      score: result.score,
      total: result.total,
      points: result.points,
      completedAt: new Date().toISOString(),
      title: completedLesson?.title,
      topic: completedLesson?.topic,
      format: completedLesson?.format,
      level: completedLesson?.level,
    };
    setLessonResults((current) => {
      const next = { ...current, [result.lessonId]: saved };
      writeLocal(RESULTS_KEY, next);
      return next;
    });

    if (completedLesson) {
      const attempt: LessonAttempt = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        lessonId: result.lessonId,
        title: completedLesson.title,
        topic: completedLesson.topic,
        format: completedLesson.format,
        level: completedLesson.level,
        score: result.score,
        total: result.total,
        points: result.points,
        completedAt: saved.completedAt,
      };
      setAttempts((current) => {
        const next = [attempt, ...current].slice(0, 100);
        writeLocal(ATTEMPTS_KEY, next);
        return next;
      });
    }

    if (!alreadyCompleted) {
      setAssignments((current) => {
        const next = current.map((assignment) =>
          (assignment.contentId ?? assignment.id) === result.lessonId
            ? { ...assignment, done: Math.min(assignment.done + 1, assignment.total) }
            : assignment
        );
        writeLocal(ASSIGN_KEY, next);
        return next;
      });

    }

    // Свободную практику можно повторять: баллы начисляются за каждое честное прохождение.
    const currentPoints = readLocal<{ ezhi: number; oli: number }>(POINTS_KEY, {
      ezhi: 0,
      oli: 0,
    });
    const lesson = completedLesson;
    const mascot = lesson?.level === "Олимпиада" ? "oli" : "ezhi";
    writeLocal(POINTS_KEY, {
      ...currentPoints,
      [mascot]: currentPoints[mascot] + result.points,
    });
    setToast({
      mascot,
      points: result.points,
      text:
        mascot === "oli"
          ? `+${result.points} за олимпиадную практику`
          : `+${result.points} за выполненное задание`,
    });
    setSelectedLesson(null);
  };

  const handleAddStudent = (student: Student) => {
    setStudentsList((curr) => {
      const next = [student, ...curr];
      writeLocal(STUDENTS_KEY, next);
      return next;
    });
  };

  const handleUpdateStudent = (id: string, updated: Partial<Student>) => {
    setStudentsList((curr) => {
      const next = curr.map((s) => (s.id === id ? { ...s, ...updated } : s));
      writeLocal(STUDENTS_KEY, next);
      return next;
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudentsList((curr) => {
      const next = curr.filter((s) => s.id !== id);
      writeLocal(STUDENTS_KEY, next);
      return next;
    });
  };

  const updateTeacherName = (name: string) => {
    setTeacherName(name);
    writeLocal("ch2-teacher-name", name);
  };

  const updateProgram = (newSets: Set[]) => {
    setProgramSets(newSets);
    writeLocal(PROGRAM_KEY, newSets);
  };

  const content = () => {
    switch (tab) {
      case "overview":
        return (
          <Overview
            onCreate={() => setTab("assignments")}
            onOpenStudents={() => setTab("students")}
            onOpenContent={() => setTab("assignments")}
            onOpenWords={() => setTab("assignments")}
            assignments={assignments}
            students={studentsList}
            attempts={attempts}
            teacherName={effectiveName}
          />
        );
      case "students":
        return (
          <StudentsView
            students={studentsList}
            isAdmin={isAdmin}
            onAdd={handleAddStudent}
            onUpdate={handleUpdateStudent}
            onDelete={handleDeleteStudent}
          />
        );
      case "assignments":
        return (
          <AssignmentsHub
            isAdmin={isAdmin}
            assignments={assignments}
            customVocabSets={customVocabSets}
            onAddAssignment={addAssignment}
            onOpenAssignment={openAssignment}
            onToggleAssignmentStatus={toggleAssignmentStatus}
            onDeleteAssignment={deleteAssignment}
            onSaveVocab={(set: import("../../data/vocabulary").LessonVocabSet) => {
              setCustomVocabSets((curr) => {
                const next = [set, ...curr];
                writeLocal(CUSTOM_VOCAB_KEY, next);
                return next;
              });
            }}
            lessonResults={lessonResults}
            onAward={(pts: number) => {
              if (isAdmin) return;
              const currentPoints = readLocal<{ ezhi: number; oli: number }>(POINTS_KEY, { ezhi: 0, oli: 0 });
              const nextPoints = { ...currentPoints, oli: currentPoints.oli + pts };
              writeLocal(POINTS_KEY, nextPoints);
              setToast({ mascot: "oli", points: pts, text: "Отличная практика в Lexis Lab!" });
            }}
          />
        );
      case "settings":
        return <SettingsView teacherName={teacherName} onNameChange={updateTeacherName} />;
      case "home":
        return (
          <StudentHome
            lessonResults={lessonResults}
            attempts={attempts}
            onOpenLesson={openLessonById}
            onBrowse={() => setTab("assignments")}
            profile={guestProfile}
            onEditProfile={() => setShowOnboarding(true)}
          />
        );
      case "program":
        return (
          <ProgramView 
            lessonResults={lessonResults} 
            onOpenLesson={openLessonById}
            onOpenLexis={() => setTab("assignments")} 
            isAdmin={isAdmin}
            sets={programSets}
            onSetsChange={updateProgram}
          />
        );
      case "lexis":
        return (
          <LexisLab
            customSets={customVocabSets}
            onAward={(pts: number) => {
              if (isAdmin) return;
              const currentPoints = readLocal<{ ezhi: number; oli: number }>(POINTS_KEY, { ezhi: 0, oli: 0 });
              const nextPoints = { ...currentPoints, oli: currentPoints.oli + pts };
              writeLocal(POINTS_KEY, nextPoints);
              setToast({ mascot: "oli", points: pts, text: "Отличная практика в Lexis Lab!" });
            }}
          />
        );
      case "progress":
        return (
          <ProgressView
            results={lessonResults}
            attempts={attempts}
            onOpen={openLessonById}
            onBrowse={() => setTab("assignments")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div id="top" className="flex min-h-screen bg-paper-2/60">
      {/* Сайдбар (десктоп) */}
      <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col border-r border-line bg-paper lg:flex">
        <div className="flex items-center justify-between border-b border-line/70 px-6 py-5">
          <Logo />
          <Bell attempts={attempts} />
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={
                "pressable flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-bold transition-all " +
                (tab === t.id
                  ? "bg-ink text-paper shadow-[0_14px_28px_-14px_rgba(27,23,18,0.6)]"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink")
              }
            >
              <t.icon className={"h-5 w-5 " + (tab === t.id ? "text-hl" : "")} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-line/70 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-extrabold text-white ${user.color}`}
            >
              {user.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{user.name}</p>
              <p className="truncate text-[11px] font-bold text-ink/40">{user.roleLabel}</p>
            </div>
            <button
              onClick={onLogout}
              className="pressable grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-ink/50 transition-colors hover:border-rose hover:bg-rose/5 hover:text-rose"
              aria-label="Выйти"
              title="Выйти"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Основная область */}
      <div className="min-w-0 flex-1">
        {/* Мобильная шапка + вкладки */}
        <div className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo />
            <div className="flex items-center gap-2">
              <Bell attempts={attempts} />
              <button
                onClick={onLogout}
                className="pressable inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-extrabold text-ink transition-colors hover:border-rose hover:text-rose"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </div>
          </div>
          <nav className="flex gap-1.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={
                  "pressable inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-extrabold whitespace-nowrap transition-colors " +
                  (tab === t.id ? "bg-ink text-paper" : "bg-white text-ink-soft")
                }
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {content()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {selectedLesson && (
          <AssignmentPlayer
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
            onComplete={completeLesson}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <MascotToast toast={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {!isAdmin && showOnboarding && (
          <GuestOnboarding
            initial={guestProfile}
            onComplete={saveGuestProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
