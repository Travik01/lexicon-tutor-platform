import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArrowUpRight,
  Check,
  Clock3,
  ExternalLink,
  Library,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { CONTENT_SOURCES } from "../../data/lessons";
import type { Assignment } from "../../data/mock";
import { getDraftInfo } from "../../data/progress";
import { CodeChip, FormatBadge, Panel, SectionTitle } from "./shared";

export type SavedLessonResult = {
  score: number;
  total: number;
  points: number;
  completedAt: string;
  title?: string;
  topic?: string;
  format?: Assignment["format"];
  level?: string;
};

const ADMIN_FILTERS = [
  { id: "all", label: "Все" },
  { id: "active", label: "Активные" },
  { id: "done", label: "Завершённые" },
] as const;

const CATALOG_FILTERS = ["Все", "ЕГЭ", "Грамматика", "Слова", "Чтение", "Аудирование", "Олимпиада"];

export default function AssignmentsView({
  assignments,
  onCreate,
  onOpen,
  onToggleStatus,
  onDelete,
  results = {},
  readOnly = false,
}: {
  assignments: Assignment[];
  onCreate?: () => void;
  onOpen: (assignment: Assignment) => void;
  onToggleStatus?: (assignmentId: string) => void;
  onDelete?: (assignmentId: string) => void;
  results?: Record<string, SavedLessonResult>;
  readOnly?: boolean;
}) {
  const [adminFilter, setAdminFilter] = useState<(typeof ADMIN_FILTERS)[number]["id"]>("all");
  const [catalogFilter, setCatalogFilter] = useState("Все");
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: assignments.length,
      active: assignments.filter((assignment) => assignment.status === "active").length,
      done: assignments.filter((assignment) => assignment.status === "done").length,
    }),
    [assignments]
  );

  const list = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = assignments.filter((assignment) => {
      const passesState = readOnly || adminFilter === "all" || assignment.status === adminFilter;
      const passesCategory =
        !readOnly ||
        catalogFilter === "Все" ||
        assignment.topic === catalogFilter ||
        assignment.level === catalogFilter;
      const passesSearch =
        !search ||
        `${assignment.title} ${assignment.topic} ${assignment.description ?? ""} ${assignment.format}`
          .toLowerCase()
          .includes(search);
      return passesState && passesCategory && passesSearch;
    });

    // Сортировка по приоритету: начатые → свойские → новые → пройденные
    const priority = (assignment: Assignment) => {
      const id = assignment.contentId ?? assignment.id;
      if (getDraftInfo(id)) return 0;
      if (assignment.id.startsWith("new-")) return 1;
      if (results[id]) return 3;
      return 2;
    };
    return [...filtered].sort(
      (a, b) => priority(a) - priority(b) || a.title.localeCompare(b.title, "ru")
    );
  }, [adminFilter, assignments, catalogFilter, query, readOnly, results]);

  return (
    <div className="space-y-6">
      <SectionTitle
        title={readOnly ? "Библиотека занятий" : "Задания"}
        hint={
          readOnly
            ? `${assignments.length} наборов · ${assignments.reduce((s, a) => s + (a.itemCount ?? 8), 0)}+ упражнений · свободный доступ`
            : "открой предпросмотр, скопируй код или создай свой набор для класса"
        }
        action={
          !readOnly && onCreate ? (
            <button
              onClick={onCreate}
              className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-paper transition-colors hover:bg-accent"
            >
              <Plus className="h-4.5 w-4.5" />
              Создать задание
            </button>
          ) : undefined
        }
      />

      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {(readOnly ? CATALOG_FILTERS : ADMIN_FILTERS).map((filter) => {
              const id = typeof filter === "string" ? filter : filter.id;
              const label = typeof filter === "string" ? filter : filter.label;
              const active = readOnly ? catalogFilter === id : adminFilter === id;
              return (
                <button
                  key={id}
                  onClick={() =>
                    readOnly
                      ? setCatalogFilter(id)
                      : setAdminFilter(id as (typeof ADMIN_FILTERS)[number]["id"])
                  }
                  className={
                    "pressable relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-extrabold transition-colors " +
                    (active ? "text-paper" : "bg-paper-2/70 text-ink-soft hover:text-ink")
                  }
                >
                  {active && (
                    <motion.span
                      layoutId={readOnly ? "catalog-filter" : "assign-filter"}
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <span className="relative">{label}</span>
                  {!readOnly && (
                    <span className={`relative grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ${active ? "bg-hl text-ink" : "bg-white text-ink/45"}`}>
                      {counts[id as keyof typeof counts]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти тему или формат"
              className="w-full rounded-2xl border-2 border-line bg-paper/60 py-2.5 pr-4 pl-11 text-sm font-bold outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
            />
          </div>
        </div>
      </Panel>

      {list.length === 0 ? (
        <Panel className="p-12 text-center">
          <Library className="mx-auto h-8 w-8 text-ink/25" />
          <p className="mt-3 font-display text-lg font-semibold">Ничего не нашлось</p>
          <p className="mt-1 text-sm font-semibold text-ink/45">Сбрось фильтр или попробуй другое слово.</p>
        </Panel>
      ) : (
        <motion.div layout className="grid gap-4 xl:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((assignment, index) => {
              const cohortPercent = Math.round((assignment.done / Math.max(assignment.total, 1)) * 100);
              const saved = results[assignment.contentId ?? assignment.id];
              const draft = getDraftInfo(assignment.contentId ?? assignment.id);
              const itemCount = assignment.itemCount ?? 8;
              return (
                <motion.article
                  layout
                  key={assignment.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: Math.min(index * 0.035, 0.25), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex h-full flex-col rounded-[24px] border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_26px_54px_-28px_rgba(108,77,246,.42)] sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <FormatBadge format={assignment.format} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-ink-soft uppercase">
                          {assignment.topic}
                        </span>
                        {assignment.level && (
                          <span className="rounded-full border border-accent/20 bg-accent/[.06] px-2.5 py-1 font-display text-[10px] font-bold text-accent-deep">
                            {assignment.level}
                          </span>
                        )}
                        {saved && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-extrabold text-[#13683f]">
                            <Check className="h-3 w-3" />
                            пройдено {saved.score}/{saved.total}
                          </span>
                        )}
                        {draft && !saved && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-tangerine/12 px-2.5 py-1 text-[10px] font-extrabold text-[#b3541a]">
                            вопрос {draft.index + 1} из {itemCount}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 font-display text-lg leading-snug font-semibold tracking-tight">
                        {assignment.title}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-relaxed font-medium text-ink-soft">
                    {assignment.description ?? "Набор для самостоятельной практики и работы с классом."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line/70 py-3 text-xs font-bold text-ink/45">
                    <span className="inline-flex items-center gap-1.5">
                      <Library className="h-3.5 w-3.5" />
                      {assignment.itemCount ?? 8} упражнений
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {assignment.duration ?? 7} минут
                    </span>
                    <span>{assignment.format}</span>
                  </div>

                  {!readOnly && (
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <CodeChip code={assignment.code} />
                        <span className="text-[11px] font-bold text-ink/40">{assignment.deadline}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                          <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${cohortPercent}%` }} />
                        </div>
                        <span className="text-[11px] font-extrabold text-ink-soft tabular-nums">
                          класс: {assignment.done}/{assignment.total}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => onOpen(assignment)}
                      className="pressable inline-flex min-w-44 flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-extrabold text-paper transition-colors hover:bg-accent"
                    >
                      {readOnly
                        ? draft
                          ? `Продолжить с вопроса ${draft.index + 1}`
                          : saved
                            ? "Пройти ещё раз"
                            : "Начать занятие"
                        : "Открыть предпросмотр"}
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                    {!readOnly && onToggleStatus && (
                      <button
                        onClick={() => onToggleStatus(assignment.id)}
                        className="pressable inline-flex items-center gap-2 rounded-2xl border-2 border-ink/10 px-4 py-3 text-xs font-extrabold text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
                        title={assignment.status === "active" ? "Завершить задание" : "Вернуть в активные"}
                      >
                        {assignment.status === "active" ? (
                          <Archive className="h-4 w-4" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        {assignment.status === "active" ? "Завершить" : "Возобновить"}
                      </button>
                    )}
                    {!readOnly && assignment.id.startsWith("new-") && onDelete && (
                      <button
                        onClick={() => {
                          if (confirmDelete === assignment.id) {
                            onDelete(assignment.id);
                            setConfirmDelete(null);
                          } else {
                            setConfirmDelete(assignment.id);
                            window.setTimeout(() => setConfirmDelete(null), 3500);
                          }
                        }}
                        className={
                          "pressable inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-extrabold transition-colors " +
                          (confirmDelete === assignment.id
                            ? "bg-rose text-white"
                            : "border-2 border-rose/25 text-rose hover:bg-rose/[.06]")
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        {confirmDelete === assignment.id ? "Точно удалить?" : "Удалить"}
                      </button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {readOnly && (
        <Panel className="border-dashed bg-paper-2/45 p-5">
          <p className="text-xs font-extrabold tracking-[0.16em] text-ink/40 uppercase">Методическая основа</p>
          <p className="mt-2 text-[13px] leading-relaxed font-semibold text-ink-soft">
            Все упражнения составлены специально для Чистовика. Форматы сверены со структурой ЕГЭ-2026, а темы B1–B2 — с открытыми учебными навигаторами.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONTENT_SOURCES.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-extrabold text-accent-deep transition-colors hover:border-accent/40"
              >
                {source.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}