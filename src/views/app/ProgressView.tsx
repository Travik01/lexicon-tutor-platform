import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Check,
  Clock3,
  Flame,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { LESSON_BY_ID } from "../../data/lessons";
import type { LessonAttempt } from "../../data/progress";
import type { SavedLessonResult } from "./AssignmentsView";
import { Panel, SectionTitle } from "./shared";

type Achievement = {
  title: string;
  text: string;
  icon: LucideIcon;
  unlocked: boolean;
  color: string;
};

function readPoints() {
  try {
    const raw = localStorage.getItem("ch2-points");
    return raw ? (JSON.parse(raw) as { ezhi: number; oli: number }) : { ezhi: 0, oli: 0 };
  } catch {
    return { ezhi: 0, oli: 0 };
  }
}

export default function ProgressView({
  results,
  attempts,
  onOpen,
  onBrowse,
}: {
  results: Record<string, SavedLessonResult>;
  attempts: LessonAttempt[];
  onOpen: (lessonId: string) => void;
  onBrowse: () => void;
}) {
  const entries = Object.entries(results)
    .filter(([lessonId, result]) => Boolean(LESSON_BY_ID[lessonId] || result.title))
    .sort(([, a], [, b]) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const points = readPoints();
  const totalPoints = points.ezhi + points.oli;
  const completed = entries.length;
  const perfect = entries.filter(([, result]) => result.score === result.total).length;
  const words = entries.reduce(
    (sum, [lessonId, result]) =>
      sum +
      ((LESSON_BY_ID[lessonId]?.format ?? result.format) === "Карточки" ? result.score : 0),
    0
  );
  const scoredRows = attempts.length
    ? attempts
    : entries.map(([lessonId, result]) => ({
        lessonId,
        title: LESSON_BY_ID[lessonId]?.title ?? result.title ?? "Занятие",
        topic: LESSON_BY_ID[lessonId]?.topic ?? result.topic ?? "Практика",
        format: LESSON_BY_ID[lessonId]?.format ?? result.format ?? "Квиз",
        level: LESSON_BY_ID[lessonId]?.level ?? result.level ?? "B1",
        score: result.score,
        total: result.total,
        points: result.points,
        completedAt: result.completedAt,
        id: lessonId,
      }));

  // Точность считается только по занятиям с вариантами ответов (квизы, блиц),
  // карточки и открытые ответы не искажают показатель.
  const quizRows = scoredRows.filter(
    (a) => a.format === "Квиз" || a.format === "Блиц" || a.format === "Чтение" || a.format === "Аудирование"
  );
  const accuracy = quizRows.length
    ? Math.round(
        (quizRows.reduce((sum, a) => sum + a.score, 0) /
          Math.max(1, quizRows.reduce((sum, a) => sum + a.total, 0))) *
          100
      )
    : 0;

  const byTopic = new Map<string, { score: number; total: number; count: number }>();
  scoredRows.forEach((attempt) => {
    const topic = attempt.topic;
    const current = byTopic.get(topic) ?? { score: 0, total: 0, count: 0 };
    byTopic.set(topic, {
      score: current.score + attempt.score,
      total: current.total + attempt.total,
      count: current.count + 1,
    });
  });

  const topicRows = [...byTopic.entries()]
    .map(([topic, data]) => ({
      topic,
      count: data.count,
      percent: Math.round((data.score / Math.max(data.total, 1)) * 100),
    }))
    .sort((a, b) => b.percent - a.percent);

  const achievements: Achievement[] = [
    {
      title: "Первый шаг",
      text: "Завершить первое занятие",
      icon: Sparkles,
      unlocked: completed >= 1,
      color: "bg-accent text-white",
    },
    {
      title: "Без единой ошибки",
      text: "Пройти набор идеально",
      icon: Star,
      unlocked: perfect >= 1,
      color: "bg-hl text-ink",
    },
    {
      title: "Словарный запас",
      text: "Выучить 10 слов",
      icon: BookOpen,
      unlocked: words >= 10,
      color: "bg-mint text-white",
    },
    {
      title: "Любознательность",
      text: "Закрыть 5 разных занятий",
      icon: Award,
      unlocked: completed >= 5,
      color: "bg-tangerine text-white",
    },
    {
      title: "Сотник",
      text: "Заработать 1000 баллов",
      icon: Trophy,
      unlocked: totalPoints >= 1000,
      color: "bg-sky text-white",
    },
    {
      title: "Большой маршрут",
      text: "Завершить 12 занятий",
      icon: Target,
      unlocked: completed >= 12,
      color: "bg-rose text-white",
    },
  ];

  const nextGoal = completed < 1 ? 1 : completed < 5 ? 5 : completed < 12 ? 12 : 17;
  const goalProgress = Math.min(100, Math.round((completed / nextGoal) * 100));

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Мой путь"
        hint="история занятий, сильные темы и достижения"
        action={
          <button
            onClick={onBrowse}
            className="pressable rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-paper transition-colors hover:bg-accent"
          >
            Выбрать занятие
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Занятий", value: completed, icon: Check, color: "bg-accent text-white" },
          { label: "Точность", value: `${accuracy}%`, icon: Target, color: "bg-mint text-white" },
          { label: "Знакомых слов", value: words, icon: BookOpen, color: "bg-tangerine text-white" },
          { label: "Всего баллов", value: totalPoints, icon: Trophy, color: "bg-hl text-ink" },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
          >
            <Panel className="h-full p-5">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-3xl font-bold tabular-nums">{metric.value}</p>
              <p className="mt-1 text-xs font-extrabold text-ink/45">{metric.label}</p>
            </Panel>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.25fr]">
        <Panel className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Следующая цель</h2>
              <p className="mt-1 text-xs font-bold text-ink/40">
                {completed >= 12 ? "пройди всю библиотеку" : `заверши ${nextGoal} занятий`}
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/10 text-accent-deep">
              <Flame className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-6 font-display text-3xl font-bold">
            {completed} <span className="text-base text-ink/35">/ {nextGoal}</span>
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-paper-2">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent to-tangerine"
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-2 text-[11px] font-bold text-ink/40">{goalProgress}% маршрута закрыто</p>
        </Panel>

        <Panel className="p-6">
          <h2 className="font-display text-lg font-semibold">Освоение тем</h2>
          {topicRows.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {topicRows.map((row, index) => (
                <div key={row.topic}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-extrabold">{row.topic}</span>
                    <span className="text-xs font-extrabold text-ink/40">{row.percent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2">
                    <motion.div
                      className={
                        "h-full rounded-full " +
                        (row.percent >= 85 ? "bg-mint" : row.percent >= 60 ? "bg-accent" : "bg-tangerine")
                      }
                      initial={{ width: 0 }}
                      animate={{ width: `${row.percent}%` }}
                      transition={{ delay: index * 0.05, duration: 0.6 }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-ink/35">наборов: {row.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper/60 p-6 text-center">
              <p className="text-sm font-bold text-ink-soft">Диаграмма появится после первого занятия.</p>
            </div>
          )}
        </Panel>
      </div>

      <Panel className="p-6">
        <h2 className="font-display text-lg font-semibold">Достижения</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={
                "flex items-center gap-3.5 rounded-2xl border p-4 " +
                (achievement.unlocked ? "border-mint/30 bg-mint/[.04]" : "border-line bg-paper/50 opacity-55")
              }
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${achievement.unlocked ? achievement.color : "bg-paper-3 text-ink/35"}`}>
                {achievement.unlocked ? <achievement.icon className="h-5 w-5" /> : <LockKeyhole className="h-4.5 w-4.5" />}
              </span>
              <div>
                <p className="text-[14px] font-extrabold">{achievement.title}</p>
                <p className="mt-0.5 text-[11px] font-bold text-ink/40">{achievement.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>

      <Panel className="p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">История занятий</h2>
            <p className="text-xs font-bold text-ink/40">последние сохранённые результаты</p>
          </div>
        </div>
        {scoredRows.length ? (
          <div className="mt-5 space-y-2.5">
            {scoredRows.slice(0, 8).map((attempt) => {
              return (
                <button
                  key={attempt.id}
                  onClick={() => onOpen(attempt.lessonId)}
                  className="pressable flex w-full items-center gap-4 rounded-2xl border border-line bg-paper/45 px-4 py-3.5 text-left transition-colors hover:border-accent/35 hover:bg-white"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint/10 text-mint">
                    <Check className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{attempt.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-ink/40">
                      <Clock3 className="h-3 w-3" />
                      {new Date(attempt.completedAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                      })}
                      <span>· {attempt.format}</span>
                    </p>
                  </div>
                  <span className="font-display text-sm font-bold tabular-nums">
                    {attempt.score}/{attempt.total}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-line bg-paper/50 p-8 text-center">
            <p className="text-sm font-extrabold">История пока пустая</p>
            <p className="mt-1 text-xs font-semibold text-ink/45">Выбери первое занятие — результат появится здесь.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}