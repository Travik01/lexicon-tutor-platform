import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Check, 
  CheckCircle, 
  ChevronRight, 
  Edit2, 
  Flame, 
  Plus, 
  Search, 
  Send, 
  Trash2, 
  Users, 
  X 
} from "lucide-react";
import { type Student } from "../../data/mock";
import { LevelBadge, Panel, SectionTitle } from "./shared";

function topicsOf(p: number) {
  const clamp = (v: number) => Math.max(28, Math.min(99, Math.round(v)));
  return [
    { t: "Грамматика", v: clamp(p + 4) },
    { t: "Лексика", v: clamp(p - 6) },
    { t: "Аудирование", v: clamp(p + 1) },
    { t: "Говорение", v: clamp(p - 3) },
  ];
}

function StudentDrawer({
  student,
  onClose,
}: {
  student: Student | null;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setSent(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    if (student) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [student, onClose]);

  const p = student?.progress ?? 0;
  const R = 44;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {student && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] cursor-default bg-ink/40 backdrop-blur-[2px]"
            aria-label="Закрыть карточку"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 z-[75] h-full w-full max-w-md overflow-y-auto border-l border-line bg-paper shadow-2xl"
            role="dialog"
            aria-label={`Карточка ученика: ${student.name}`}
          >
            <div className="grid-paper absolute inset-0 opacity-60" aria-hidden />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl font-display text-lg font-bold text-white ${student.color}`}
                  >
                    {student.initials}
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-bold tracking-tight">
                      {student.name}
                    </h2>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs font-bold text-ink/45">{student.cls}</span>
                      <LevelBadge level={student.level} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-ink/35">{student.email}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="pressable grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-ink/50 transition-colors hover:border-ink/30 hover:text-ink"
                  aria-label="Закрыть"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Кольцо прогресса + факты */}
              <Panel className="mt-7 flex items-center gap-6 p-5">
                <div className="relative grid h-28 w-28 shrink-0 place-items-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                    <circle cx="50" cy="50" r={R} fill="none" stroke="#eae3d2" strokeWidth="9" />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r={R}
                      fill="none"
                      stroke="#6c4df6"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={C}
                      initial={{ strokeDashoffset: C }}
                      animate={{ strokeDashoffset: C - (C * p) / 100 }}
                      transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>
                  <span className="font-display text-xl font-bold tabular-nums">{p}%</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-extrabold tracking-wide text-ink/40 uppercase">
                      Серия
                    </p>
                    <p className="flex items-center gap-1.5 text-lg font-extrabold">
                      <Flame className="h-4.5 w-4.5 fill-tangerine text-tangerine" />
                      {student.streak > 0 ? `${student.streak} дн.` : "нет"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold tracking-wide text-ink/40 uppercase">
                      Слов выучено
                    </p>
                    <p className="text-lg font-extrabold tabular-nums">
                      {student.words.toLocaleString("ru-RU")}
                    </p>
                  </div>
                </div>
              </Panel>

              {/* Темы */}
              <Panel className="mt-4 p-5">
                <h3 className="text-sm font-extrabold">Освоение тем</h3>
                <div className="mt-4 space-y-3.5">
                  {topicsOf(p).map((t, i) => (
                    <div key={t.t}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[13px] font-bold">{t.t}</span>
                        <span className="text-xs font-extrabold text-ink/40 tabular-nums">
                          {t.v}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-2">
                        <motion.div
                          className={
                            "h-full rounded-full " +
                            (t.v >= 80 ? "bg-mint" : t.v >= 60 ? "bg-accent" : "bg-tangerine")
                          }
                          initial={{ width: 0 }}
                          animate={{ width: `${t.v}%` }}
                          transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              {/* Последние действия */}
              <Panel className="mt-4 p-5 border-dashed bg-paper/50 text-center">
                <p className="text-sm font-bold text-ink/35">История занятий появится после первого задания</p>
              </Panel>

              <button
                onClick={() => {
                  setSent(true);
                  setTimeout(() => setSent(false), 2000);
                }}
                className={
                  "pressable mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold transition-colors " +
                  (sent ? "bg-mint text-white" : "bg-ink text-paper hover:bg-accent")
                }
              >
                {sent ? (
                  <>
                    <Check className="h-4.5 w-4.5" strokeWidth={3} />
                    Повторение назначено
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Назначить повторение слабых тем
                  </>
                )}
              </button>

              <p className="mt-5 text-center text-xs font-semibold text-ink/25">
                Нажми за пределами панели, чтобы закрыть
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

import GradingView from "./GradingView";

type ClassTab = "students" | "grading";

export default function StudentsView({
  students,
  isAdmin,
  onAdd,
  onUpdate,
  onDelete,
}: {
  students: Student[];
  isAdmin: boolean;
  onAdd: (s: Student) => void;
  onUpdate: (id: string, updated: Partial<Student>) => void;
  onDelete: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<ClassTab>("students");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newLevel, setNewLevel] = useState<"A1" | "A2" | "B1" | "B2" | "C1">("B1");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.cls.toLowerCase().includes(q)
    );
  }, [query, students]);

  const handleAdd = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const initials = newName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const colors = ["bg-accent", "bg-rose", "bg-tangerine", "bg-mint", "bg-sky"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    onAdd({
      id: `s-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      initials,
      cls: newClass.trim() || "Группа",
      level: newLevel,
      progress: 0,
      streak: 0,
      words: 0,
      color,
    });
    setShowAddForm(false);
    setNewName("");
    setNewEmail("");
    setNewClass("");
    setNewLevel("B1");
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 no-scrollbar overflow-x-auto pb-1">
        {[
          { id: "students", label: "Ученики", icon: Users },
          { id: "grading", label: "Проверка", icon: CheckCircle },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as ClassTab)}
            className={
              "pressable relative inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition-all " +
              (activeTab === t.id ? "bg-ink text-paper" : "bg-white text-ink-soft hover:bg-ink/5 hover:text-ink")
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "grading" ? (
        <GradingView />
      ) : (
        <>
          <SectionTitle
            title="Ученики"
            hint={`${students.length} человек · список по классам`}
            action={
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink/35" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full min-w-44 rounded-2xl border-2 border-line bg-white py-2.5 pr-4 pl-11 text-sm font-bold transition-all outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
                  />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    Добавить
                  </button>
                )}
              </div>
            }
          />

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Panel className="p-6 mb-6 border-accent/30 bg-accent/5">
              <h3 className="font-display text-lg font-bold mb-4">Добавить ученика</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="text-xs font-extrabold text-ink/50 uppercase">Имя и Фамилия</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Иван Иванов"
                    className="mt-1 w-full rounded-xl border-2 border-line bg-white px-4 py-2 text-sm font-bold outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-ink/50 uppercase">Класс</label>
                  <input
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="10 «А»"
                    className="mt-1 w-32 rounded-xl border-2 border-line bg-white px-4 py-2 text-sm font-bold outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-ink/50 uppercase">Уровень</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as "A2" | "B1" | "B2")}
                    className="mt-1 w-24 rounded-xl border-2 border-line bg-white px-4 py-2 text-sm font-bold outline-none focus:border-accent"
                  >
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAdd} className="pressable rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-deep">
                    Сохранить
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="pressable rounded-xl bg-paper-3 px-4 py-2.5 text-sm font-bold text-ink-soft hover:bg-paper-2">
                    Отмена
                  </button>
                </div>
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      {list.length === 0 ? (
        <Panel className="p-10 text-center">
          <p className="font-display text-lg font-semibold">
            {students.length === 0 ? "Список учеников пуст" : "Никого не нашлось"}
          </p>
          <p className="mt-1 text-sm font-semibold text-ink-soft/70">
            {students.length === 0
              ? "Добавьте первого ученика через кнопку выше. Ученики также появляются автоматически при входе."
              : "Попробуйте изменить запрос"}
          </p>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelected(s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(s);
                  }
                }}
                className="group block h-full w-full cursor-pointer text-left"
              >
                <Panel className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-accent/40 group-hover:shadow-[0_24px_48px_-26px_rgba(108,77,246,0.4)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-11 w-11 place-items-center rounded-2xl text-xs font-extrabold text-white ${s.color} transition-transform duration-300 group-hover:-rotate-6`}
                      >
                        {s.initials}
                      </span>
                      <div>
                        <p className="text-[15px] leading-tight font-extrabold">{s.name}</p>
                        <p className="mt-0.5 text-xs font-bold text-ink/45">{s.cls} класс</p>
                      </div>
                    </div>
                    <LevelBadge level={s.level} />
                  </div>

                  <div className="mt-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-ink/45">Прогресс по программе</span>
                      <span className="text-sm font-extrabold tabular-nums">{s.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-2">
                      <motion.div
                        className={
                          "h-full rounded-full " +
                          (s.progress >= 85 ? "bg-mint" : s.progress >= 65 ? "bg-accent" : "bg-tangerine")
                        }
                        initial={{ width: 0 }}
                        animate={{ width: `${s.progress}%` }}
                        transition={{ delay: 0.2 + i * 0.04, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3.5 text-xs font-bold text-ink-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <Flame
                        className={
                          "h-4 w-4 " +
                          (s.streak > 0 ? "fill-tangerine text-tangerine" : "text-ink/25")
                        }
                      />
                      {s.streak > 0 ? `серия ${s.streak} дн.` : "серии нет"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink/35 transition-colors group-hover:text-accent">
                      подробнее
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Panel>
                {isAdmin && (
                   <>
                     {editingId === s.id ? (
                       <div
                         onClick={(e) => e.stopPropagation()}
                         className="absolute top-2 right-2 flex items-center gap-1 z-10 bg-white border border-line rounded-xl px-2 py-1 shadow-lg"
                       >
                         <input
                           value={editName}
                           onChange={(e) => setEditName(e.target.value)}
                           onKeyDown={(e) => {
                             if (e.key === "Enter" && editName.trim()) {
                               onUpdate(s.id, { name: editName.trim() });
                               setEditingId(null);
                             }
                             if (e.key === "Escape") setEditingId(null);
                           }}
                           autoFocus
                           className="w-28 text-xs font-bold outline-none bg-transparent"
                           placeholder="Новое имя"
                         />
                         <button onClick={() => { if (editName.trim()) { onUpdate(s.id, { name: editName.trim() }); } setEditingId(null); }} className="text-mint"><Check className="h-3.5 w-3.5" /></button>
                         <button onClick={() => setEditingId(null)} className="text-ink/40"><X className="h-3.5 w-3.5" /></button>
                       </div>
                     ) : confirmDeleteId === s.id ? (
                       <div
                         onClick={(e) => e.stopPropagation()}
                         className="absolute top-2 right-2 flex items-center gap-1 z-10 bg-white border border-rose/30 rounded-xl px-2 py-1.5 shadow-lg"
                       >
                         <span className="text-[11px] font-bold text-rose">Удалить?</span>
                         <button onClick={() => { onDelete(s.id); setConfirmDeleteId(null); }} className="text-[11px] font-extrabold text-rose hover:underline">Да</button>
                         <button onClick={() => setConfirmDeleteId(null)} className="text-[11px] font-bold text-ink/45">Нет</button>
                       </div>
                     ) : (
                       <>
                         <button
                           onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditName(s.name); }}
                           className="absolute top-2 right-10 p-2 text-ink/20 opacity-0 group-hover:opacity-100 hover:text-accent transition-opacity z-10"
                           title="Изменить имя"
                         >
                           <Edit2 className="h-4 w-4" />
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id); setTimeout(() => setConfirmDeleteId(null), 4000); }}
                           className="absolute top-2 right-2 p-2 text-ink/20 opacity-0 group-hover:opacity-100 hover:text-rose transition-opacity z-10"
                           title="Удалить ученика"
                         >
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </>
                     )}
                   </>
                 )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

        </>
      )}

      <StudentDrawer student={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
