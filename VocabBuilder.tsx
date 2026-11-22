import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  FileText,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { LessonVocabSet, VocabEntry, WordCategory } from "../../data/vocabulary";
import { CATEGORIES } from "../../data/vocabulary";
import { Panel, SectionTitle } from "./shared";

const EMPTY_WORD: Omit<VocabEntry, "id"> = {
  word: "",
  translation: "",
  definition: "",
  example: "",
  partOfSpeech: "noun",
  category: "School / study",
  level: "B1",
};

const PARTS_OF_SPEECH: VocabEntry["partOfSpeech"][] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "phrasal verb",
  "collocation",
  "word formation",
];

export default function VocabBuilder({
  onSave,
  onBack,
}: {
  onSave: (set: LessonVocabSet) => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<"A2" | "B1" | "B2">("B1");
  const [words, setWords] = useState<VocabEntry[]>([
    { ...EMPTY_WORD, id: `w-${Date.now()}-0` },
    { ...EMPTY_WORD, id: `w-${Date.now()}-1` },
    { ...EMPTY_WORD, id: `w-${Date.now()}-2` },
  ]);
  const [saved, setSaved] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const updateWord = (id: string, field: keyof VocabEntry, value: string) => {
    setWords((ws) =>
      ws.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const addWord = () => {
    setWords((ws) => [...ws, { ...EMPTY_WORD, id: `w-${Date.now()}-${ws.length}` }]);
  };

  const removeWord = (id: string) => {
    setWords((ws) => ws.filter((w) => w.id !== id));
  };

  const parseBulk = () => {
    const lines = bulkText.split("\n").filter((l) => l.trim());
    const parsed: VocabEntry[] = lines.map((line, i) => {
      const parts = line.split(/[;,\t—–-]/).map((s) => s.trim());
      return {
        id: `w-bulk-${Date.now()}-${i}`,
        word: parts[0] || "",
        translation: parts[1] || "",
        definition: parts[2] || "",
        example: parts[3] || "",
        partOfSpeech: "noun" as const,
        category: "School / study" as WordCategory,
        level,
      };
    });
    setWords((ws) => [...ws, ...parsed]);
    setBulkMode(false);
    setBulkText("");
  };

  const validWords = words.filter((w) => w.word.trim() && w.translation.trim());

  const handleSave = () => {
    if (!title.trim() || validWords.length === 0) return;
    const vocabSet: LessonVocabSet = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      lessonDate: new Date().toISOString().slice(0, 10),
      level,
      words: validWords,
    };
    onSave(vocabSet);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Набор слов создан" />
        <Panel className="relative overflow-hidden bg-ink p-8 text-center text-paper">
          <div className="grid-paper-dark pointer-events-none absolute inset-0" aria-hidden />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-white">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-sm font-semibold text-paper/60">
              {validWords.length} слов · {level} · теперь доступно ученикам в Lexis Lab
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSaved(false);
                  setTitle("");
                  setWords([
                    { ...EMPTY_WORD, id: `w-${Date.now()}-0` },
                    { ...EMPTY_WORD, id: `w-${Date.now()}-1` },
                    { ...EMPTY_WORD, id: `w-${Date.now()}-2` },
                  ]);
                }}
                className="pressable rounded-2xl border border-paper/25 px-6 py-3 text-sm font-bold hover:bg-paper/10"
              >
                <Plus className="mr-2 inline h-4 w-4" />
                Создать ещё один набор
              </button>
              <button
                onClick={onBack}
                className="pressable rounded-2xl bg-hl px-6 py-3 text-sm font-bold text-ink hover:bg-paper"
              >
                Посмотреть в Lexis Lab
              </button>
            </div>
          </motion.div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Новый набор слов"
        hint="Слова и конструкции с урока для учеников"
        action={
          <button
            onClick={onBack}
            className="pressable inline-flex items-center gap-2 text-sm font-bold text-ink/45 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
        }
      />

      {/* Заголовок набора */}
      <Panel className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="vocab-title"
              className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase"
            >
              Название набора
            </label>
            <input
              id="vocab-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Unit 5, Phrasal verbs, Technology..."
              className="mt-2 w-full rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-3.5 text-[15px] font-bold outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
            />
          </div>
          <div className="shrink-0">
            <label className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
              Уровень
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as "A2" | "B1" | "B2")}
              className="mt-2 w-24 cursor-pointer rounded-2xl border-2 border-line bg-paper/60 px-4 py-3.5 font-display text-sm font-bold outline-none focus:border-accent"
            >
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </div>
        </div>
      </Panel>

      {/* Быстрый ввод списком */}
      <Panel className="border-dashed p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold">Быстрый ввод</p>
            <p className="mt-0.5 text-xs font-semibold text-ink/45">
              Одно слово на строку, разделитель — точка с запятой или табуляция
            </p>
          </div>
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className="pressable inline-flex items-center gap-2 rounded-xl border-2 border-ink/10 px-4 py-2.5 text-xs font-extrabold transition-colors hover:border-ink/30"
          >
            <FileText className="h-4 w-4" />
            {bulkMode ? "Скрыть" : "Вставить список"}
          </button>
        </div>
        <AnimatePresence>
          {bulkMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                placeholder={"achievement; достижение; a thing done successfully; a great achievement\nreliable; надёжный; someone you can trust; a reliable friend"}
                className="mt-4 w-full resize-y rounded-2xl border-2 border-line bg-white px-4 py-3 font-mono text-xs leading-relaxed outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
              <button
                onClick={parseBulk}
                disabled={!bulkText.trim()}
                className="pressable mt-3 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep disabled:opacity-40"
              >
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
                Добавить из списка
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>

      {/* Список слов */}
      <div className="space-y-3">
        {words.map((w, i) => (
          <Panel key={w.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink/5 font-display text-xs font-bold text-ink/40">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 grid gap-3 sm:grid-cols-2">
                <input
                  value={w.word}
                  onChange={(e) => updateWord(w.id, "word", e.target.value)}
                  placeholder="English word"
                  className="rounded-xl border-2 border-line bg-paper/60 px-3.5 py-2.5 text-sm font-bold outline-none focus:border-accent"
                />
                <input
                  value={w.translation}
                  onChange={(e) => updateWord(w.id, "translation", e.target.value)}
                  placeholder="Перевод"
                  className="rounded-xl border-2 border-line bg-paper/60 px-3.5 py-2.5 text-sm font-bold outline-none focus:border-accent"
                />
                <input
                  value={w.definition}
                  onChange={(e) => updateWord(w.id, "definition", e.target.value)}
                  placeholder="Definition (необязательно)"
                  className="rounded-xl border-2 border-line bg-paper/60 px-3.5 py-2.5 text-sm font-semibold text-ink-soft outline-none focus:border-accent"
                />
                <input
                  value={w.example}
                  onChange={(e) => updateWord(w.id, "example", e.target.value)}
                  placeholder="Example sentence (необязательно)"
                  className="rounded-xl border-2 border-line bg-paper/60 px-3.5 py-2.5 text-sm font-semibold text-ink-soft italic outline-none focus:border-accent"
                />
                <select
                  value={w.partOfSpeech}
                  onChange={(e) => updateWord(w.id, "partOfSpeech", e.target.value)}
                  className="rounded-xl border-2 border-line bg-paper/60 px-3 py-2.5 text-xs font-bold outline-none focus:border-accent"
                >
                  {PARTS_OF_SPEECH.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={w.category}
                  onChange={(e) => updateWord(w.id, "category", e.target.value)}
                  className="rounded-xl border-2 border-line bg-paper/60 px-3 py-2.5 text-xs font-bold outline-none focus:border-accent"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeWord(w.id)}
                className="pressable mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink/25 transition-colors hover:bg-rose/10 hover:text-rose"
                title="Удалить слово"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Panel>
        ))}
      </div>

      <button
        onClick={addWord}
        className="pressable flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 py-4 text-sm font-extrabold text-ink/40 transition-colors hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
      >
        <Plus className="h-4 w-4" />
        Добавить слово
      </button>

      {/* Кнопка сохранения */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink/5 px-6 py-5">
        <p className="text-sm font-bold text-ink-soft">
          {validWords.length > 0
            ? `${validWords.length} слов готово к публикации`
            : "Заполни хотя бы одно слово и перевод"}
        </p>
        <button
          onClick={handleSave}
          disabled={!title.trim() || validWords.length === 0}
          className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-8 py-3.5 text-sm font-extrabold text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="h-4.5 w-4.5" />
          Сохранить набор
        </button>
      </div>
    </div>
  );
}
