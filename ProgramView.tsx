import { useState } from "react";
import {
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Circle,
  CircleCheck,
  Clock,
  Edit2,
  Lock,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { LESSONS, LESSON_BY_ID, type Set } from "../../data/lessons";
import { DEMO_VOCAB_SETS } from "../../data/vocabulary";
import { Panel, SectionTitle } from "./shared";
import type { SavedLessonResult } from "./AssignmentsView";

type DeleteTarget = { moduleId: string; lessonId: string } | null;

export default function ProgramView({
  lessonResults,
  onOpenLesson,
  onOpenLexis,
  isAdmin = false,
  sets,
  onSetsChange,
}: {
  lessonResults: Record<string, SavedLessonResult>;
  onOpenLesson: (id: string) => void;
  onOpenLexis?: () => void;
  isAdmin?: boolean;
  sets: Set[];
  onSetsChange: (newSets: Set[]) => void;
}) {
  const currentMonthIdx = new Date().getMonth();
  const [selectedSetIdx, setSelectedSetIdx] = useState(currentMonthIdx);
  const [editingSet, setEditingSet] = useState(false);
  const [setTitleDraft, setSetTitleDraft] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitleDraft, setModuleTitleDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<string | null>(null);
  const [lessonToAdd, setLessonToAdd] = useState("");

  const selectedSet = sets[selectedSetIdx];

  const saveSetTitle = () => {
    if (!setTitleDraft.trim()) return;
    onSetsChange(
      sets.map((set, i) =>
        i === selectedSetIdx ? { ...set, title: setTitleDraft.trim() } : set
      )
    );
    setEditingSet(false);
  };

  const saveNewModule = () => {
    if (!newModuleTitle.trim()) return;
    onSetsChange(
      sets.map((set, i) =>
        i === selectedSetIdx
          ? {
              ...set,
              modules: [
                ...set.modules,
                {
                  id: `m-custom-${Date.now()}`,
                  title: newModuleTitle.trim(),
                  lessons: [],
                },
              ],
            }
          : set
      )
    );
    setNewModuleTitle("");
    setAddingModule(false);
  };

  const saveModuleTitle = (moduleId: string) => {
    if (!moduleTitleDraft.trim()) return;
    onSetsChange(
      sets.map((set, i) =>
        i === selectedSetIdx
          ? {
              ...set,
              modules: set.modules.map((m) =>
                m.id === moduleId ? { ...m, title: moduleTitleDraft.trim() } : m
              ),
            }
          : set
      )
    );
    setEditingModuleId(null);
    setModuleTitleDraft("");
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    onSetsChange(
      sets.map((set, i) =>
        i === selectedSetIdx
          ? {
              ...set,
              modules: set.modules.map((m) =>
                m.id === moduleId
                  ? { ...m, lessons: m.lessons.filter((id) => id !== lessonId) }
                  : m
              ),
            }
          : set
      )
    );
    setDeleteTarget(null);
  };

  const addLessonToModule = (moduleId: string) => {
    if (!lessonToAdd) return;
    onSetsChange(
      sets.map((set, i) =>
        i === selectedSetIdx
          ? {
              ...set,
              modules: set.modules.map((m) =>
                m.id === moduleId && !m.lessons.includes(lessonToAdd)
                  ? { ...m, lessons: [...m.lessons, lessonToAdd] }
                  : m
              ),
            }
          : set
      )
    );
    setLessonToAdd("");
    setAddingLessonToModuleId(null);
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title={isAdmin ? "Управление программой" : "Моя программа"}
        hint={
          isAdmin
            ? "Сеты, модули и уроки по месяцам"
            : "12 тематических сетов · 24 модуля подготовки"
        }
      />

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {sets.map((set, i) => {
          const isLocked = !isAdmin && i > currentMonthIdx;
          const isActive = selectedSetIdx === i;
          return (
            <button
              key={set.id}
              onClick={() => !isLocked && setSelectedSetIdx(i)}
              className={
                "pressable relative flex shrink-0 flex-col items-center justify-center rounded-2xl border-2 px-5 py-3 transition-all " +
                (isActive
                  ? "border-accent bg-accent/5"
                  : isLocked
                    ? "cursor-not-allowed border-line bg-paper-2 opacity-50"
                    : "border-line bg-white hover:border-ink/20")
              }
            >
              <span className={"text-[10px] font-bold uppercase tracking-widest " + (isActive ? "text-accent" : "text-ink/40")}>
                {set.month}
              </span>
              <span className="mt-1 font-display text-sm font-bold">Set {i + 1}</span>
              {isLocked && <Lock className="absolute top-2 right-2 h-3 w-3 text-ink/20" />}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {isAdmin && (
            <Panel className="p-5 border-dashed">
              {!editingSet ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/40">Текущий сет</p>
                    <h3 className="mt-1 font-display text-xl font-semibold">{selectedSet.title}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSetTitleDraft(selectedSet.title);
                      setEditingSet(true);
                    }}
                    className="pressable inline-flex items-center gap-2 rounded-xl border-2 border-ink/10 px-4 py-2.5 text-xs font-extrabold text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
                  >
                    <Edit2 className="h-4 w-4" />
                    Изменить
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">Название сета</label>
                  <div className="flex gap-2">
                    <input
                      value={setTitleDraft}
                      onChange={(e) => setSetTitleDraft(e.target.value)}
                      className="flex-1 rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                    />
                    <button onClick={saveSetTitle} className="pressable rounded-2xl bg-accent px-4 py-3 text-white"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingSet(false)} className="pressable rounded-2xl bg-paper-3 px-4 py-3 text-ink/50"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </Panel>
          )}

          {isAdmin && (
            <Panel className="p-5 border-dashed">
              {!addingModule ? (
                <button
                  onClick={() => setAddingModule(true)}
                  className="pressable flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-ink/35 transition-colors hover:text-accent"
                >
                  <Plus className="h-4 w-4" />
                  Добавить модуль
                </button>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink/45">Название модуля</label>
                  <div className="flex gap-2">
                    <input
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder="Например: Reading Skills"
                      className="flex-1 rounded-2xl border-2 border-line bg-white px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                    />
                    <button onClick={saveNewModule} className="pressable rounded-2xl bg-accent px-4 py-3 text-white"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setAddingModule(false)} className="pressable rounded-2xl bg-paper-3 px-4 py-3 text-ink/50"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </Panel>
          )}

          {selectedSet.modules.map((module, mIdx) => {
            const completedCount = module.lessons.filter((id) => lessonResults[id]).length;
            const totalCount = module.lessons.length;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <Panel key={module.id} className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-line bg-paper-2/50 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-accent">Модуль {mIdx + 1}</span>
                    {editingModuleId === module.id ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          value={moduleTitleDraft}
                          onChange={(e) => setModuleTitleDraft(e.target.value)}
                          className="flex-1 rounded-xl border-2 border-line bg-white px-3.5 py-2 text-sm font-bold outline-none focus:border-accent"
                        />
                        <button onClick={() => saveModuleTitle(module.id)} className="pressable rounded-xl bg-accent px-3 py-2 text-white"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingModuleId(null)} className="pressable rounded-xl bg-paper-3 px-3 py-2 text-ink/50"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center gap-2">
                        <h3 className="truncate font-display text-lg font-bold">{module.title}</h3>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setEditingModuleId(module.id);
                              setModuleTitleDraft(module.title);
                            }}
                            className="p-1 text-ink/20 hover:text-accent"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-display text-sm font-bold">{Math.round(progress)}%</span>
                    <p className="text-[10px] font-bold text-ink/40">Прогресс</p>
                  </div>
                </div>

                <div className="divide-y divide-line">
                  {module.lessons.length > 0 ? (
                    module.lessons.map((lessonId) => {
                      const lesson = LESSON_BY_ID[lessonId];
                      const isDone = Boolean(lessonResults[lessonId]);
                      if (!lesson) return null;

                      return (
                        <button
                          key={lessonId}
                          onClick={() => onOpenLesson(lessonId)}
                          className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-paper-2/30"
                        >
                          <div className={"shrink-0 " + (isDone ? "text-mint" : "text-ink/20")}>
                            {isDone ? <CircleCheck className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={"truncate text-[15px] font-bold " + (isDone ? "text-ink/50" : "text-ink")}>
                              {lesson.title}
                            </p>
                            <div className="mt-0.5 flex items-center gap-3">
                              <span className="text-[11px] font-bold uppercase text-ink/30">{lesson.format}</span>
                              <span className="flex items-center gap-1 text-[11px] font-bold text-ink/30">
                                <Clock className="h-3 w-3" />
                                {lesson.duration} мин
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isAdmin && (
                              deleteTarget?.moduleId === module.id && deleteTarget.lessonId === lessonId ? (
                                <div className="flex items-center gap-1 rounded-xl border border-rose/30 bg-white px-2 py-1 text-[11px] font-bold text-rose">
                                  <span>Удалить?</span>
                                  <button onClick={(e) => { e.stopPropagation(); deleteLesson(module.id, lessonId); }}>Да</button>
                                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(null); }} className="text-ink/45">Нет</button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({ moduleId: module.id, lessonId });
                                    window.setTimeout(() => setDeleteTarget(null), 4000);
                                  }}
                                  className="p-2 text-ink/10 hover:text-rose transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )
                            )}
                            <ChevronRight className="h-5 w-5 text-ink/10" />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-6 py-5 text-sm font-semibold text-ink/30">В модуле пока нет уроков</div>
                  )}

                  {isAdmin && (
                    <div className="bg-paper/40 px-6 py-4">
                      {addingLessonToModuleId === module.id ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <select
                            value={lessonToAdd}
                            onChange={(e) => setLessonToAdd(e.target.value)}
                            className="flex-1 rounded-xl border-2 border-line bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-accent"
                          >
                            <option value="">Выберите урок</option>
                            {LESSONS.filter((lesson) => !module.lessons.includes(lesson.id)).map((lesson) => (
                              <option key={lesson.id} value={lesson.id}>
                                {lesson.title}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button onClick={() => addLessonToModule(module.id)} className="pressable rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white">Добавить</button>
                            <button onClick={() => { setAddingLessonToModuleId(null); setLessonToAdd(""); }} className="pressable rounded-xl bg-paper-3 px-4 py-2.5 text-sm font-bold text-ink/50">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingLessonToModuleId(module.id)}
                          className="pressable inline-flex items-center gap-2 text-sm font-extrabold text-accent-deep transition-colors hover:text-accent"
                        >
                          <Plus className="h-4 w-4" />
                          Добавить урок
                        </button>
                      )}
                    </div>
                  )}

                  {module.vocabSetId && (() => {
                    const vocabSet = DEMO_VOCAB_SETS.find((s) => s.id === module.vocabSetId);
                    if (!vocabSet) return null;
                    return (
                      <button
                        onClick={onOpenLexis}
                        className="flex w-full items-center gap-4 border-t-2 border-dashed border-accent/20 px-6 py-4 text-left transition-colors hover:bg-paper-2/30"
                      >
                        <div className="shrink-0 text-accent">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] font-bold text-accent-deep">Lexis Lab: {vocabSet.title}</p>
                          <p className="text-[11px] font-bold text-ink/30">{vocabSet.words.length} слов · {vocabSet.level} · словарь + игры</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-accent/30" />
                      </button>
                    );
                  })()}
                </div>
              </Panel>
            );
          })}
        </div>

        <div className="space-y-4">
          <Panel className="relative overflow-hidden bg-ink p-6 text-paper">
            <div className="grid-paper-dark absolute inset-0 opacity-10" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <Calendar className="mb-4 h-8 w-8 text-hl" />
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSetTitleDraft(selectedSet.title);
                      setEditingSet(true);
                    }}
                    className="p-2 text-paper/20 transition-colors hover:text-hl"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h4 className="font-display text-xl font-bold">{selectedSet.month}</h4>
              <p className="mt-2 text-sm leading-relaxed text-paper/60">
                {isAdmin
                  ? "Структура этого месяца доступна для редактирования."
                  : "Доступ к этому сету открыт до конца месяца. Выполняй задания в удобном темпе."}
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold uppercase text-paper/40">Статус</span>
                  <span className="text-sm font-bold text-mint">{isAdmin ? "Редактируется" : "Активен"}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/3 bg-hl" />
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-ink/40">
              Lexis Lab
            </h4>
            <p className="text-sm font-semibold text-ink/50">
              Для каждого модуля можно открыть словарь и игровые форматы.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
