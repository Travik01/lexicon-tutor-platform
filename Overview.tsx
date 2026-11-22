import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck, Download, Sparkles, Target, Users } from "lucide-react";
import { type Assignment, type Student } from "../../data/mock";
import { getWeekActivity, type LessonAttempt } from "../../data/progress";
import { Panel, SectionTitle } from "./shared";

export default function Overview({
  onCreate,
  onOpenStudents,
  onOpenContent,
  onOpenWords,
  assignments,
  students,
  attempts,
  teacherName = "Преподаватель",
}: {
  onCreate: () => void;
  onOpenStudents: () => void;
  onOpenContent: () => void;
  onOpenWords: () => void;
  assignments: Assignment[];
  students: Student[];
  attempts: LessonAttempt[];
  teacherName?: string;
}) {
  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const activeAssignments = assignments.filter((assignment) => assignment.status === "active");
  const responses = assignments.reduce((sum, assignment) => sum + assignment.done, 0);
  const possibleResponses = assignments.reduce((sum, assignment) => sum + assignment.total, 0);
  const completion = Math.round((responses / Math.max(possibleResponses, 1)) * 100);
  const avgProgress =
    students.length > 0
      ? Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length)
      : 0;
  const week = getWeekActivity(attempts).map((value, index) => ({
    d: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][index],
    v: value,
  }));
  const feed = attempts.slice(0, 4).map((attempt, i) => ({
    who: students[i % Math.max(students.length, 1)]?.name ?? `Ученик ${i + 1}`,
    what: attempt.title,
    score: `${attempt.score}/${attempt.total}`,
    time: new Date(attempt.completedAt).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    }),
    color: students[i % Math.max(students.length, 1)]?.color ?? "bg-accent",
  }));
  const stats = [
    { icon: Users, label: "Ученики", value: String(students.length), delta: "в активных группах", iconCls: "bg-accent text-white" },
    { icon: Target, label: "Выполнение", value: `${completion}%`, delta: "по всем заданиям", iconCls: "bg-mint text-white" },
    { icon: ClipboardCheck, label: "Прогресс", value: `${avgProgress}%`, delta: `получено ответов: ${responses}`, iconCls: "bg-tangerine text-white" },
    { icon: Sparkles, label: "Активно", value: String(activeAssignments.length), delta: `заданий для класса`, iconCls: "bg-sky text-white" },
  ];

  const downloadReport = () => {
    const rows = [
      ["Название", "Тема", "Формат", "Код", "Статус", "Выполнили", "Всего", "Срок"],
      ...assignments.map((assignment) => [
        assignment.title,
        assignment.topic,
        assignment.format,
        assignment.code,
        assignment.status === "active" ? "Активно" : "Завершено",
        String(assignment.done),
        String(assignment.total),
        assignment.deadline,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.split('"').join('""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chistovik-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={teacherName || "Обзор"}
        hint={today}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadReport}
              className="pressable inline-flex items-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 text-xs font-extrabold text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
            >
              <Download className="h-4 w-4" />
              Скачать отчёт
            </button>
            <button
              onClick={onCreate}
              className="pressable group inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-paper shadow-[0_16px_32px_-14px_rgba(27,23,18,0.5)] transition-all hover:bg-accent"
            >
              <Sparkles className="h-4.5 w-4.5" />
              Создать задание
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        }
      />

      {/* Быстрые действия */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Добавить ученика", text: "Создать карточку нового ученика", onClick: onOpenStudents },
          { title: "Создать задание", text: "Сгенерировать код для класса", onClick: onOpenContent },
          { title: "Добавить слова", text: "Собрать набор для Lexis Lab", onClick: onOpenWords },
        ].map((card) => (
          <Panel key={card.title} className="p-5 border-dashed">
            <p className="font-display text-base font-semibold">{card.title}</p>
            <p className="mt-1 text-sm font-semibold text-ink/45">{card.text}</p>
            <button
              onClick={card.onClick}
              className="pressable mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-accent-deep transition-colors hover:text-accent"
            >
              Открыть
              <ArrowRight className="h-4 w-4" />
            </button>
          </Panel>
        ))}
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Panel className="group h-full p-5 transition-shadow hover:shadow-[0_20px_44px_-24px_rgba(27,23,18,0.35)]">
              <span
                className={`inline-grid h-10 w-10 place-items-center rounded-xl ${s.iconCls} transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105`}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="mt-1 text-[13px] font-bold text-ink-soft">{s.label}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink/40">{s.delta}</p>
            </Panel>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Активность недели */}
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Активность класса</h2>
              <p className="text-xs font-semibold text-ink/40">ответов за день · эта неделя</p>
            </div>
            <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-extrabold text-[#13683f]">
              {attempts.length > 0 ? `${attempts.length} попыток` : "данных пока нет"}
            </span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-3 sm:gap-4">
            {week.map((d, i) => (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-extrabold text-ink/50 tabular-nums">{d.v}</span>
                <motion.div
                  className={
                    "w-full rounded-t-xl " +
                    (i === 3 ? "bg-accent" : "bg-ink/12 hover:bg-accent/50")
                  }
                  style={{ height: `${(d.v / 100) * 130 + 14}px` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="text-[11px] font-bold text-ink/45">{d.d}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Последние ответы */}
        <Panel className="p-6">
          <h2 className="font-display text-lg font-semibold">Последние ответы</h2>
          {feed.length > 0 ? (
            <ul className="mt-5 space-y-4">
              {feed.map((f, i) => (
                <motion.li
                  key={f.who + f.time}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white ${f.color}`}
                  >
                    {f.who
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {f.who} <span className="font-semibold text-ink-soft/80">· {f.what}</span>
                    </p>
                    <p className="text-[11px] font-semibold text-ink/40">{f.time}</p>
                  </div>
                  <span className="rounded-lg bg-paper-2 px-2 py-1 text-xs font-extrabold whitespace-nowrap">
                    {f.score}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-paper/50 p-8 text-center">
              <p className="text-sm font-bold text-ink/40">Пока нет проверяемых ответов</p>
              <p className="mt-1 text-xs font-semibold text-ink/25">
                Список появится после первых выполненных заданий
              </p>
            </div>
          )}
        </Panel>
      </div>

      {/* Темы по результатам */}
      <Panel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold">Результаты по темам</h2>
            <p className="text-xs font-semibold text-ink/40">
              {attempts.length > 0
                ? `по ${attempts.length} попыткам учеников`
                : "данные появятся после первых занятий"}
            </p>
          </div>
          <button
            onClick={onCreate}
            className="pressable rounded-xl border-2 border-ink/10 px-4 py-2 text-xs font-extrabold transition-colors hover:border-ink/30"
          >
            Назначить повторение
          </button>
        </div>
        {attempts.length > 0 ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {(() => {
              const byTopic = new Map<string, { score: number; total: number }>();
              attempts.forEach((a) => {
                const cur = byTopic.get(a.topic) ?? { score: 0, total: 0 };
                byTopic.set(a.topic, { score: cur.score + a.score, total: cur.total + a.total });
              });
              return [...byTopic.entries()]
                .map(([topic, data]) => ({ topic, pct: Math.round((data.score / Math.max(data.total, 1)) * 100) }))
                .sort((a, b) => a.pct - b.pct)
                .slice(0, 4)
                .map((t, i) => (
                  <div key={t.topic}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] leading-tight font-bold">{t.topic}</p>
                      <span className="text-xs font-extrabold text-ink/40 tabular-nums">{t.pct}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-tangerine to-rose"
                        initial={{ width: 0 }}
                        animate={{ width: `${t.pct}%` }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ));
            })()}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper/50 p-8 text-center">
            <p className="text-sm font-bold text-ink/30">Ученики ещё не прошли ни одного занятия</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
