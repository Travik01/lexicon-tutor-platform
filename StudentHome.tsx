import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Flame,
  Headphones,
  Layers,
  Play,
  Settings2,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import { LESSON_BY_ID } from "../../data/lessons";
import { getDraftInfo, getStreak, getWeekActivity, type LessonAttempt } from "../../data/progress";
import { FormatBadge, Panel, SectionTitle } from "./shared";
import MascotToast, { MASCOTS, type Toast } from "./MascotToast";
import DuelGame, { type DuelOutcome } from "./DuelGame";
import type { SavedLessonResult } from "./AssignmentsView";
import { GOAL_LABELS, type GuestProfile } from "./GuestOnboarding";

const POINTS_KEY = "ch2-points";

const BASE_POINTS = { ezhi: 0, oli: 0 };

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default function StudentHome({
  lessonResults = {},
  attempts = [],
  onOpenLesson,
  onBrowse,
  profile,
  onEditProfile,
}: {
  lessonResults?: Record<string, SavedLessonResult>;
  attempts?: LessonAttempt[];
  onOpenLesson: (lessonId: string) => void;
  onBrowse: () => void;
  profile: GuestProfile | null;
  onEditProfile: () => void;
}) {
  const [duelOpen, setDuelOpen] = useState(false);
  const [points, setPoints] = useState<{ ezhi: number; oli: number }>(() =>
    load(POINTS_KEY, BASE_POINTS)
  );
  const [toast, setToast] = useState<Toast | null>(null);
  const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  const completedIds = new Set(Object.keys(lessonResults));
  const completedCount = completedIds.size;
  const presentPerfectResult = lessonResults["present-perfect"];
  const learnedWords = Object.entries(lessonResults).reduce(
    (sum, [lessonId, saved]) =>
      sum +
      ((LESSON_BY_ID[lessonId]?.format ?? saved.format) === "Карточки" ? saved.score : 0),
    0
  );
  const weekActivity = getWeekActivity(attempts);
  const streak = getStreak(attempts);

  const planByGoal = {
    ege: ["ege-grammar", "word-formation", "email-writing", "speaking-interview", "present-perfect"],
    olympiad: ["olympiad-idioms", "reading-digital-habits", "conditionals", "technology-vocab"],
    general: ["future-forms", "technology-vocab", "listening-dialogue", "used-to", "reading-green-city"],
  } as const;
  const planIds: string[] = profile ? [...planByGoal[profile.goal]] : [...planByGoal.general];
  const planIdSet = new Set(planIds);
  const primaryPlan = planIds
    .filter((lessonId) => !completedIds.has(lessonId) && LESSON_BY_ID[lessonId])
    .map((lessonId) => LESSON_BY_ID[lessonId]);
  const fallbackPlan = Object.values(LESSON_BY_ID).filter(
    (lesson) => !completedIds.has(lesson.id) && !planIdSet.has(lesson.id)
  );
  const dailyPlan = [...primaryPlan, ...fallbackPlan].slice(0, 3);

  // Универсальный плеер начисляет баллы в AppArea: синхронизируем виджеты при изменении истории.
  useEffect(() => {
    setPoints(load(POINTS_KEY, BASE_POINTS));
  }, [lessonResults]);

  const award = (m: "ezhi" | "oli", pts: number) => {
    setPoints((p) => {
      const next = { ...p, [m]: p[m] + pts };
      save(POINTS_KEY, next);
      return next;
    });
  };

  const finishDuel = (pts: number, outcome: DuelOutcome) => {
    setDuelOpen(false);
    if (pts <= 0) return;
    award("oli", pts);
    setToast({
      mascot: "oli",
      points: pts,
      text:
        outcome === "win"
          ? `Победа! +${pts} баллов`
          : outcome === "tie"
            ? `Ничья. +${pts} баллов`
            : `Поражение, но +${pts} баллов за попытку`,
    });
  };

  const quizDraft = getDraftInfo("present-perfect");

  return (
    <div className="space-y-6">
      <SectionTitle
        title={profile?.name ? `Привет, ${profile.name.split(" ")[0]}!` : "Привет!"}
        hint={
          completedCount > 0
            ? `${today} · завершено занятий: ${completedCount}`
            : `${today} · начни первое занятие, чтобы запустить серию`
        }
        action={
          <button
            onClick={onEditProfile}
            className="pressable inline-flex items-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 text-xs font-extrabold text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
          >
            <Settings2 className="h-4 w-4 text-accent" />
            {profile?.goal ? `${GOAL_LABELS[profile.goal]}` : "Настройки маршрута"}
          </button>
        }
      />

      {/* Проводники и баллы */}
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(MASCOTS) as (keyof typeof MASCOTS)[]).map((id, i) => {
          const m = MASCOTS[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Panel className="group flex h-full items-center gap-4 p-4.5 transition-shadow hover:shadow-[0_20px_44px_-26px_rgba(27,23,18,0.35)]">
                <img
                  src={m.img}
                  alt={`Маскот ${m.name}`}
                  className={`h-16 w-16 shrink-0 rounded-2xl border border-line object-cover ring-4 ${m.ring} transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold">
                    {m.name}{" "}
                    <span className="font-sans text-xs font-bold text-ink/40">· {m.role}</span>
                  </p>
                  <p className="mt-0.5 truncate text-xs font-bold text-ink-soft/70">{m.earns}</p>
                </div>
                <div className="text-right">
                  <motion.p
                    key={points[id]}
                    initial={{ scale: 1.35, color: "#6c4df6" }}
                    animate={{ scale: 1, color: "#1b1712" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-2xl font-bold tabular-nums"
                  >
                    {points[id].toLocaleString("ru-RU")}
                  </motion.p>
                  <p className="text-[10px] font-extrabold tracking-wider text-ink/40 uppercase">
                    баллов
                  </p>
                </div>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Panel className="relative overflow-hidden bg-ink p-6 text-paper">
          <div className="grid-paper-dark pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-hl text-ink">
              <Flame className="h-5.5 w-5.5 fill-tangerine text-tangerine" />
            </span>
            <p className="mt-4 font-display text-4xl font-bold">
              {streak} {streak === 1 ? "день" : streak > 1 && streak < 5 ? "дня" : "дней"}
            </p>
            <p className="mt-1 text-sm font-bold text-paper/60">
              {streak > 0 ? "серия идёт — возвращайся завтра" : "серия начнётся с первого занятия"}
            </p>
          </div>
        </Panel>

        <Panel className="p-6">
          <span className="inline-grid h-11 w-11 place-items-center rounded-2xl bg-accent text-white">
            <BookOpen className="h-5.5 w-5.5" />
          </span>
          <p className="mt-4 font-display text-4xl font-bold">{learnedWords}</p>
          <p className="mt-1 text-sm font-bold text-ink-soft/70">
            {learnedWords > 0 ? "слов отмечено как знакомые" : "слов выучено"}
          </p>
        </Panel>

        <Panel className="p-6 sm:col-span-2 xl:col-span-1">
          <p className="text-sm font-extrabold">Минута практики каждый день</p>
          <div className="mt-4 flex h-20 items-end gap-2">
            {weekActivity.map((v, i) => (
              <motion.div
                key={i}
                className={"flex-1 rounded-t-lg " + (v > 0 ? "bg-accent" : "bg-ink/10")}
                style={{ height: `${v + 6}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] font-bold text-ink/40">
            {attempts.length > 0
              ? "активность за эту неделю"
              : "график заполнится после первого занятия"}
          </p>
        </Panel>
      </div>

      {/* Персональный план */}
      <Panel className="relative overflow-hidden p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -top-20 -right-12 h-52 w-52 rounded-full bg-hl/25 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.18em] text-accent-deep uppercase">
              План на сегодня
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              Рекомендуемые занятия
            </h2>
            <p className="mt-1 text-sm font-semibold text-ink-soft/70">
              Грамматика, лексика и навыки чтения — по 5–10 минут каждое
            </p>
          </div>
          <button
            onClick={onBrowse}
            className="pressable inline-flex items-center gap-2 text-sm font-extrabold text-accent-deep transition-colors hover:text-accent"
          >
            Вся библиотека
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {dailyPlan.length ? (
          <div className="relative mt-5 grid gap-3 lg:grid-cols-3">
            {dailyPlan.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => onOpenLesson(lesson.id)}
                className="pressable group flex items-center gap-3.5 rounded-2xl border border-line bg-paper/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white hover:shadow-[0_16px_34px_-22px_rgba(108,77,246,.5)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink font-display text-xs font-bold text-hl transition-transform group-hover:-rotate-6">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-extrabold">{lesson.title}</span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] font-bold text-ink/40">
                    <Clock3 className="h-3 w-3" />
                    {lesson.duration} минут · {lesson.format}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-ink/25 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
              </button>
            ))}
          </div>
        ) : (
          <div className="relative mt-5 rounded-2xl border border-mint/30 bg-mint/[.06] p-5 text-center">
            <p className="text-sm font-extrabold text-[#13683f]">
              План закрыт — можно выбрать любую новую тему.
            </p>
          </div>
        )}
      </Panel>

      {/* Свободная практика — код не нужен */}
      <Panel className="border-dashed bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Быстрая практика</h2>
            <p className="mt-1 text-sm font-bold text-ink-soft/80">
              Выбери формат и начни прямо сейчас
            </p>
          </div>

        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() => onOpenLesson("future-forms")}
            className="pressable group flex items-center gap-3.5 rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-hl hover:bg-white hover:shadow-[0_14px_28px_-16px_rgba(242,183,5,0.6)]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-hl text-ink transition-transform duration-300 group-hover:-rotate-6">
              <Zap className="h-5.5 w-5.5" />
            </span>
            <span>
              <span className="block text-[15px] font-extrabold">Квиз</span>
              <span className="block text-xs font-bold text-ink/45">future forms · 8 вопросов</span>
            </span>
          </button>

          <button
            onClick={() => onOpenLesson("irregular-verbs")}
            className="pressable group flex items-center gap-3.5 rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-white hover:shadow-[0_14px_28px_-16px_rgba(108,77,246,0.5)]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-white transition-transform duration-300 group-hover:-rotate-6">
              <Layers className="h-5.5 w-5.5" />
            </span>
            <span>
              <span className="block text-[15px] font-extrabold">Карточки</span>
              <span className="block text-xs font-bold text-ink/45">неправильные глаголы · 10</span>
            </span>
          </button>

          <button
            onClick={() => onOpenLesson("listening-dialogue")}
            className="pressable group flex items-center gap-3.5 rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-sky/50 hover:bg-white hover:shadow-[0_14px_28px_-16px_rgba(62,123,250,0.5)]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky text-white transition-transform duration-300 group-hover:-rotate-6">
              <Headphones className="h-5.5 w-5.5" />
            </span>
            <span>
              <span className="block text-[15px] font-extrabold">Аудирование</span>
              <span className="block text-xs font-bold text-ink/45">диалог с озвучкой</span>
            </span>
          </button>

          <button
            onClick={() => setDuelOpen(true)}
            className="pressable group flex items-center gap-3.5 rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-tangerine/60 hover:bg-white hover:shadow-[0_14px_28px_-16px_rgba(255,138,61,0.55)]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-tangerine text-white transition-transform duration-300 group-hover:-rotate-6">
              <Swords className="h-5.5 w-5.5" />
            </span>
            <span>
              <span className="block text-[15px] font-extrabold">Игра-дуэль</span>
              <span className="block text-xs font-bold text-ink/45">бой со словами против Оли</span>
            </span>
          </button>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Ближайшее задание */}
        <Panel className="relative overflow-hidden p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-center gap-5">
            <FormatBadge format="Квиз" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold tracking-[0.18em] text-ink/40 uppercase">
                Задание по коду LONDON-42
              </p>
              <p className="mt-1 font-display text-xl font-semibold">
                Present Perfect vs Past Simple
              </p>
              <p className="mt-1 text-sm font-bold text-ink-soft/70">8 вопросов · без срока</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenLesson("present-perfect")}
              className={
                "pressable inline-flex items-center gap-2.5 rounded-2xl px-7 py-4 text-base font-bold text-paper transition-all " +
                (presentPerfectResult
                  ? "bg-mint"
                  : quizDraft
                    ? "bg-tangerine shadow-[0_18px_36px_-14px_rgba(255,138,61,0.55)]"
                    : "bg-ink shadow-[0_18px_36px_-14px_rgba(27,23,18,0.55)] hover:bg-accent")
              }
            >
              {presentPerfectResult ? (
                <>
                  <Check className="h-5 w-5" strokeWidth={3} />
                  Результат: {presentPerfectResult.score}/{presentPerfectResult.total}
                </>
              ) : quizDraft ? (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  Продолжить с вопроса {quizDraft.index + 1}
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  Пройти квиз
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence>
            {presentPerfectResult && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative mt-4 flex items-center gap-2 rounded-2xl border border-mint/30 bg-[#f0fbf5] px-4 py-3 text-sm font-bold text-[#13683f]"
              >
                <Sparkles className="h-4.5 w-4.5" />
                {presentPerfectResult.score === presentPerfectResult.total
                  ? "Идеально — ни одной ошибки! Эжи уже зачислил баллы."
                  : "Неплохо! Разбор ошибок сохранён, набор можно пройти повторно."}
              </motion.p>
            )}
          </AnimatePresence>
        </Panel>

        {/* Карточки дня */}
        <Panel className="relative flex flex-col justify-between overflow-hidden p-6">
          <div
            className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-center gap-4">
            <span className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-white">
              <Layers className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="text-xs font-extrabold tracking-[0.18em] text-ink/40 uppercase">
                Карточки дня
              </p>
              <p className="mt-0.5 font-display text-lg leading-tight font-semibold">
                Фразовые глаголы с get
              </p>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-relaxed font-semibold text-ink-soft/80">
            8 фразовых глаголов с переводом и примерами
          </p>
          <button
            onClick={() => onOpenLesson("phrasal-get")}
            className="pressable relative mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-extrabold text-paper transition-colors hover:bg-accent"
          >
            <Play className="h-4 w-4 fill-current" />
            {lessonResults["phrasal-get"]
              ? `Пройдено: ${lessonResults["phrasal-get"].score}/${lessonResults["phrasal-get"].total} — повторить`
              : "Открыть колоду"}
          </button>
        </Panel>
      </div>

      {/* Модалки и тосты */}
      <AnimatePresence>
        {duelOpen && <DuelGame onClose={() => setDuelOpen(false)} onFinish={finishDuel} />}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <MascotToast toast={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
