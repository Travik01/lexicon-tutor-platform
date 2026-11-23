import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Grid3x3,
  Layers,
  PenLine,
  Plus,
  Search,
  Shuffle,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CATEGORIES,
  DEMO_VOCAB_SETS,
  generateCompleteSentence,
  generateGroupSort,
  generateMatchPairs,
  generateQuiz,
  type VocabEntry,
  type WordCategory,
} from "../../data/vocabulary";
import { Panel, SectionTitle } from "./shared";

type LabFormat =
  | "dictionary"
  | "quiz"
  | "flashcards"
  | "match"
  | "group-sort"
  | "complete"
  | "wheel"
  | "memory"
  | "unjumble"
  | "anagram"
  | "open-box"
  | "match-definition";

const FORMAT_CARDS: { id: LabFormat; icon: typeof Zap; title: string; text: string }[] = [
  { id: "match", icon: Shuffle, title: "Match up", text: "Соедини английские фразы с переводом" },
  { id: "quiz", icon: Zap, title: "Quiz", text: "Выбери правильный перевод или значение" },
  { id: "flashcards", icon: Layers, title: "Flash cards", text: "Переворачивай карточку: слово → перевод" },
  { id: "unjumble", icon: Shuffle, title: "Unjumble", text: "Собери предложение в правильном порядке" },
  { id: "wheel", icon: Shuffle, title: "Spin the wheel", text: "Крути колесо и выполняй мини-задание" },
  { id: "group-sort", icon: Grid3x3, title: "Group sort", text: "Разложи слова по категориям" },
  { id: "complete", icon: PenLine, title: "Complete the sentence", text: "Вставь слово в пропуск" },
  { id: "anagram", icon: PenLine, title: "Anagram", text: "Собери слово из букв" },
  { id: "open-box", icon: Grid3x3, title: "Open the box", text: "Открой коробку и выполни задание" },
  { id: "match-definition", icon: Shuffle, title: "Find the match", text: "Найди пару: слово + определение" },
  { id: "memory", icon: Grid3x3, title: "Matching pairs", text: "Игра memory: открой совпадающие пары" },
];

/* ───── Словарь ───── */
function DictionaryView({
  words,
  query,
  categoryFilter,
}: {
  words: VocabEntry[];
  query: string;
  categoryFilter: WordCategory | "All";
}) {
  const { filtered, phrasalVerbs, collocations, wordFormation, emergentLanguage } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = words.filter(
      (w) =>
        (categoryFilter === "All" || w.category === categoryFilter) &&
        (!q ||
          w.word.toLowerCase().includes(q) ||
          w.translation.toLowerCase().includes(q) ||
          w.definition.toLowerCase().includes(q))
    );
    return {
      filtered: all.filter((w) => 
        w.partOfSpeech !== "phrasal verb" && 
        w.partOfSpeech !== "collocation" && 
        w.partOfSpeech !== "word formation" && 
        w.category !== "People / reactions"
      ),
      phrasalVerbs: all.filter((w) => w.partOfSpeech === "phrasal verb"),
      collocations: all.filter((w) => w.partOfSpeech === "collocation"),
      wordFormation: all.filter((w) => w.partOfSpeech === "word formation"),
      emergentLanguage: all.filter((w) => w.category === "People / reactions"),
    };
  }, [words, query, categoryFilter]);

  return (
    <div className="space-y-8">
      {filtered.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-base font-bold flex items-center gap-2 opacity-50 px-1">
            <BookOpen className="h-4 w-4" />
            Core Vocabulary
          </h3>
          <div className="space-y-2">
            {filtered.map((w, i) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Panel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-bold">{w.word}</span>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-extrabold text-accent-deep uppercase">{w.partOfSpeech}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-ink-soft">{w.translation}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft/70">{w.definition}</p>
                  </div>
                  <div className="shrink-0 rounded-xl bg-paper-2/60 px-4 py-2.5 text-[13px] leading-relaxed font-semibold text-ink-soft italic sm:max-w-xs">{w.example}</div>
                </Panel>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {phrasalVerbs.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-base font-bold flex items-center gap-2 text-tangerine px-1">
            <Zap className="h-4 w-4" />
            Phrasal Verbs
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {phrasalVerbs.map((w) => (
              <Panel key={w.id} className="p-4 border-l-4 border-l-tangerine bg-paper/30">
                <p className="font-display text-base font-bold">{w.word}</p>
                <p className="text-sm font-bold text-ink-soft mt-1">{w.translation}</p>
                <p className="mt-2 text-xs italic text-ink-soft/60">{w.example}</p>
              </Panel>
            ))}
          </div>
        </section>
      )}

      {collocations.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-base font-bold flex items-center gap-2 text-sky px-1">
            <Shuffle className="h-4 w-4" />
            Collocations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {collocations.map((w) => (
              <Panel key={w.id} className="p-4 border-l-4 border-l-sky bg-sky/[.03]">
                <p className="font-display text-base font-bold">{w.word}</p>
                <p className="text-sm font-bold text-ink-soft mt-1">{w.translation}</p>
                <p className="mt-2 text-xs text-ink-soft/60 italic">{w.example}</p>
              </Panel>
            ))}
          </div>
        </section>
      )}

      {wordFormation.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-base font-bold flex items-center gap-2 text-accent px-1">
            <Grid3x3 className="h-4 w-4" />
            Word Formation
          </h3>
          <Panel className="p-0 overflow-hidden bg-accent/[.02]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/5 text-[10px] font-extrabold uppercase tracking-widest text-accent-deep border-b border-line">
                  <th className="px-5 py-3">Base Word</th>
                  <th className="px-5 py-3">Derived</th>
                  <th className="px-5 py-3">Перевод</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {wordFormation.map((w) => (
                  <tr key={w.id} className="hover:bg-accent/[.04] transition-colors">
                    <td className="px-5 py-3 text-sm font-bold text-ink-soft">{w.formationBase}</td>
                    <td className="px-5 py-3 text-sm font-extrabold text-accent-deep">{w.word}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-ink-soft/70">{w.translation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </section>
      )}

      {emergentLanguage.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-base font-bold flex items-center gap-2 text-mint px-1">
            <Sparkles className="h-4 w-4" />
            Emergent Language
          </h3>
          <Panel className="p-0 overflow-hidden bg-white/50">
            <div className="divide-y divide-line">
              {emergentLanguage.map((w) => (
                <div key={w.id} className="p-4 hover:bg-paper-2/30 transition-colors flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                    <span className="font-bold text-[15px]">{w.word}</span>
                  </div>
                  <span className="text-ink/30 hidden sm:inline">—</span>
                  <span className="text-sm font-bold text-ink-soft/80 flex-1">{w.translation}</span>
                  <span className="text-[12px] italic text-ink/40 font-medium">{w.example}</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      )}

      {filtered.length === 0 && phrasalVerbs.length === 0 && emergentLanguage.length === 0 && (
        <Panel className="p-12 text-center border-dashed bg-paper/30">
          <p className="text-sm font-bold text-ink/30">No words match your search or filter.</p>
        </Panel>
      )}
    </div>
  );
}

/* ───── Квиз ───── */
function QuizView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const questions = useMemo(() => generateQuiz(words), [words]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setCorrect((c) => c + 1);
  };
  const next = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setPicked(null);
    setIndex((i) => i + 1);
  };

  if (finished)
    return (
      <Panel className="p-8 text-center">
        <p className="font-display text-2xl font-bold">
          {correct}/{questions.length}
        </p>
        <p className="mt-2 text-sm font-semibold text-ink-soft">
          {correct === questions.length ? "Все верно!" : "Есть над чем поработать."}
        </p>
        <button onClick={onFinish} className="pressable mt-5 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-accent">
          Готово
        </button>
      </Panel>
    );

  return (
    <Panel className="p-6 sm:p-7">
      <p className="text-xs font-extrabold text-ink/40 uppercase">
        Вопрос {index + 1} из {questions.length}
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold">{q.prompt}</h3>
      <div className="mt-5 space-y-2.5">
        {q.options.map((opt, i) => {
          const state =
            picked === null
              ? "idle"
              : i === q.correct
                ? "right"
                : i === picked
                  ? "wrong"
                  : "dim";
          return (
            <button
              key={opt}
              onClick={() => pick(i)}
              disabled={picked !== null}
              className={
                "pressable flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-bold transition-all " +
                (state === "idle" ? "border-line bg-paper/60 hover:border-ink/35" : "") +
                (state === "right" ? " border-mint bg-[#eafaf1]" : "") +
                (state === "wrong" ? " border-rose bg-rose/[.06]" : "") +
                (state === "dim" ? " border-line opacity-40" : "")
              }
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink-soft">{q.explanation}</p>
          <button onClick={next} className="pressable shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-bold text-paper hover:bg-accent">
            {isLast ? "Результат" : "Дальше"}
          </button>
        </div>
      )}
    </Panel>
  );
}

/* ───── Карточки ───── */
function FlashView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const w = words[index];
  const isLast = index === words.length - 1;

  const mark = (ok: boolean) => {
    if (ok) setKnown((k) => k + 1);
    if (isLast) {
      onFinish();
      return;
    }
    setFlipped(false);
    setTimeout(() => setIndex((i) => i + 1), 80);
  };

  return (
    <div>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="relative block h-64 w-full [perspective:1000px]"
      >
        <motion.span
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative block h-full w-full [transform-style:preserve-3d]"
        >
          <span className="grid-paper absolute inset-0 flex flex-col items-center justify-center rounded-[22px] border-2 border-line bg-paper px-6 text-center [backface-visibility:hidden]">
            <span className="font-display text-3xl font-bold">{w.word}</span>
            <span className="mt-2 text-xs font-bold text-ink/40">{w.partOfSpeech} · {w.category}</span>
            <span className="mt-3 text-xs font-bold text-ink/30">Нажми на карточку</span>
          </span>
          <span className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] bg-accent px-6 text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="font-display text-2xl font-bold">{w.translation}</span>
            <span className="mt-2 text-sm font-semibold text-white/75">{w.definition}</span>
            <span className="mt-2 text-xs italic text-white/55">{w.example}</span>
          </span>
        </motion.span>
      </button>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => mark(false)} className="pressable rounded-2xl border-2 border-rose/30 bg-rose/5 py-3.5 text-sm font-extrabold text-rose">
          Ещё повторю
        </button>
        <button onClick={() => mark(true)} className="pressable rounded-2xl bg-mint py-3.5 text-sm font-extrabold text-white">
          Знаю
        </button>
      </div>
      <p className="mt-3 text-center text-xs font-bold text-ink/40">
        {index + 1} из {words.length} · знаю {known}
      </p>
    </div>
  );
}

/* ───── Match up ───── */
function MatchView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const pairs = useMemo(() => generateMatchPairs(words), [words]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const shuffledRight = useMemo(
    () => [...pairs].sort(() => Math.random() - 0.5),
    [pairs]
  );

  const tryMatch = (rightId: string) => {
    if (!selectedLeft) return;
    const pair = pairs.find((p) => p.id === selectedLeft);
    const rightPair = pairs.find((p) => p.id === rightId);
    if (pair && rightPair && pair.id === rightPair.id) {
      setMatched((m) => new Set([...m, pair.id]));
    }
    setSelectedLeft(null);
  };

  if (matched.size === pairs.length)
    return (
      <Panel className="p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-mint" />
        <p className="mt-3 font-display text-xl font-bold">Все пары найдены!</p>
        <button onClick={onFinish} className="pressable mt-5 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-accent">
          Готово
        </button>
      </Panel>
    );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs font-extrabold text-ink/40 uppercase">English</p>
        {pairs.map((p) => (
          <button
            key={p.id}
            disabled={matched.has(p.id)}
            onClick={() => setSelectedLeft(p.id)}
            className={
              "pressable w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-all " +
              (matched.has(p.id)
                ? "border-mint/30 bg-mint/10 text-mint line-through opacity-60"
                : selectedLeft === p.id
                  ? "border-accent bg-accent/10 text-accent-deep"
                  : "border-line hover:border-ink/30")
            }
          >
            {p.left}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-extrabold text-ink/40 uppercase">Перевод</p>
        {shuffledRight.map((p) => (
          <button
            key={p.id + "-r"}
            disabled={matched.has(p.id)}
            onClick={() => tryMatch(p.id)}
            className={
              "pressable w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-all " +
              (matched.has(p.id)
                ? "border-mint/30 bg-mint/10 text-mint line-through opacity-60"
                : "border-line hover:border-ink/30")
            }
          >
            {p.right}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───── Group sort ───── */
function GroupSortView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const groups = useMemo(() => generateGroupSort(words), [words]);
  const allWords = useMemo(() => groups.flatMap((g) => g.words).sort(() => Math.random() - 0.5), [groups]);
  const [placed, setPlaced] = useState<Record<string, string[]>>(
    Object.fromEntries(groups.map((g) => [g.category, []]))
  );
  const [remaining, setRemaining] = useState(allWords);

  const place = (word: string, cat: string) => {
    const correct = groups.find((g) => g.category === cat);
    if (!correct?.words.includes(word)) return;
    setPlaced((p) => ({ ...p, [cat]: [...(p[cat] ?? []), word] }));
    setRemaining((r) => r.filter((w) => w !== word));
  };

  const total = allWords.length;
  const done = total - remaining.length;

  if (remaining.length === 0)
    return (
      <Panel className="p-8 text-center">
        <Check className="mx-auto h-10 w-10 text-mint" />
        <p className="mt-3 font-display text-xl font-bold">Все слова разложены!</p>
        <button onClick={onFinish} className="pressable mt-5 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-accent">
          Готово
        </button>
      </Panel>
    );

  return (
    <div>
      <p className="text-xs font-bold text-ink/40">{done}/{total} размещено</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {remaining.map((w) => (
          <span
            key={w}
            className="rounded-full border border-accent/25 bg-accent/5 px-3.5 py-1.5 text-xs font-extrabold text-accent-deep"
          >
            {w}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {groups.map((g) => (
          <Panel key={g.category} className="p-4">
            <p className="text-xs font-extrabold text-ink/50 uppercase">{g.category}</p>
            <div className="mt-2 min-h-16 space-y-1.5">
              {(placed[g.category] ?? []).map((w) => (
                <span key={w} className="block rounded-lg bg-mint/10 px-3 py-1.5 text-xs font-bold text-[#13683f]">
                  {w}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {remaining.map((w) => (
                <button
                  key={w + g.category}
                  onClick={() => place(w, g.category)}
                  className="pressable rounded-lg border border-line px-2.5 py-1 text-[11px] font-bold text-ink-soft transition-colors hover:border-accent/40 hover:bg-accent/5"
                >
                  + {w}
                </button>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

/* ───── Complete the sentence ───── */
function CompleteView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const questions = useMemo(() => generateCompleteSentence(words), [words]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const q = questions[index];
  const isCorrect = q.answers.includes(value.trim().toLowerCase());
  const isLast = index === questions.length - 1;

  const submit = () => {
    if (!value.trim()) return;
    if (!checked) {
      setChecked(true);
      return;
    }
    if (isLast) {
      onFinish();
      return;
    }
    setIndex((i) => i + 1);
    setValue("");
    setChecked(false);
  };

  return (
    <Panel className="p-6">
      <p className="text-xs font-extrabold text-ink/40 uppercase">
        {index + 1} из {questions.length}
      </p>
      <h3 className="mt-2 font-display text-xl font-semibold">{q.prompt}</h3>
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setChecked(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Введи слово"
        className={
          "mt-4 w-full rounded-2xl border-2 bg-paper/60 px-4 py-3.5 font-display text-base font-semibold outline-none transition-all focus:bg-white focus:ring-4 " +
          (checked
            ? isCorrect
              ? "border-mint focus:ring-mint/15"
              : "border-rose focus:ring-rose/15"
            : "border-line focus:border-accent focus:ring-accent/15")
        }
      />
      {checked && (
        <p className={`mt-3 text-sm font-semibold ${isCorrect ? "text-[#13683f]" : "text-rose"}`}>
          {isCorrect ? "Верно! " : `Ответ: ${q.answers[0]}. `}
          {q.explanation}
        </p>
      )}
      <button
        onClick={submit}
        disabled={!value.trim()}
        className="pressable mt-4 w-full rounded-2xl bg-ink py-3.5 text-sm font-bold text-paper transition-colors enabled:hover:bg-accent disabled:opacity-30"
      >
        {checked ? (isLast ? "Завершить" : "Дальше") : "Проверить"}
      </button>
    </Panel>
  );
}

/* ───── Spin the Wheel ───── */
function WheelView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<VocabEntry | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);
    setTimeout(() => {
      setSpinning(false);
      const index = Math.floor(Math.random() * words.length);
      setSelected(words[index]);
    }, 2000);
  };

  return (
    <Panel className="p-8 text-center flex flex-col items-center">
      <div className="relative h-64 w-64">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 2, ease: "circOut" }}
          className="h-full w-full rounded-full border-8 border-ink relative overflow-hidden"
          style={{ backgroundImage: `conic-gradient(from 0deg, #6c4df6 0deg 90deg, #ff8a3d 90deg 180deg, #1fa36b 180deg 270deg, #3e7bfa 270deg 360deg)` }}
        >
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-1 bg-ink/10 rotate-45" />
              <div className="h-full w-1 bg-ink/10 -rotate-45" />
           </div>
        </motion.div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 z-10">
           <div className="w-3 h-6 bg-rose rounded-full border-2 border-ink" />
        </div>
      </div>
      <div className="mt-8 min-h-[120px]">
        {selected ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <p className="text-xs font-bold text-ink/40 uppercase tracking-widest">Твое слово:</p>
            <p className="font-display text-2xl font-bold mt-1">{selected.word}</p>
            <p className="text-ink-soft font-bold mt-1">{selected.translation}</p>
            <button onClick={spin} className="pressable mt-4 rounded-xl border-2 border-ink px-6 py-2 text-sm font-bold">Крутить еще раз</button>
          </motion.div>
        ) : (
          <button onClick={spin} disabled={spinning} className="pressable rounded-2xl bg-ink px-10 py-4 text-lg font-bold text-paper shadow-xl hover:bg-accent disabled:opacity-50">
            {spinning ? "Крутим..." : "Spin the Wheel!"}
          </button>
        )}
      </div>
      <button onClick={onFinish} className="mt-6 text-xs font-bold text-ink/30 hover:text-ink">Закончить</button>
    </Panel>
  );
}

/* ───── Anagram Game ───── */
function AnagramView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const w = words[index];
  
  // Track indices to allow multiple same letters
  const [guessIndices, setGuessIndices] = useState<number[]>([]);
  const letters = useMemo(() => 
    w.word.toLowerCase().replace(/\s/g, "").split("").map((l, i) => ({ l, i })).sort(() => Math.random() - 0.5), 
    [w]
  );
  
  const [checked, setChecked] = useState(false);
  const guessStr = guessIndices.map(idx => letters.find(item => item.i === idx)?.l).join("");
  const isCorrect = guessStr === w.word.toLowerCase().replace(/\s/g, "");
  const isLast = index === words.length - 1;

  const addLetter = (idx: number) => {
    if (checked || guessIndices.includes(idx)) return;
    setGuessIndices([...guessIndices, idx]);
  };

  const removeLetter = (idx: number) => {
    if (checked) return;
    setGuessIndices(guessIndices.filter(i => i !== idx));
  };

  const submit = () => {
    if (guessIndices.length === 0) return;
    if (!checked) {
      if (guessIndices.length < letters.length) return;
      setChecked(true);
      return;
    }
    if (isLast) onFinish();
    else {
      setIndex((i) => i + 1);
      setGuessIndices([]);
      setChecked(false);
    }
  };

  return (
    <Panel className="p-6 text-center">
       <p className="text-xs font-extrabold text-ink/40 uppercase">{index + 1} из {words.length}</p>
       <h3 className="mt-2 font-display text-xl font-semibold">Собери слово из букв</h3>
       <p className="mt-1 text-sm font-bold text-ink-soft/70">"{w.translation}"</p>
       
       <div className="mt-8 flex min-h-12 flex-wrap justify-center gap-2 border-b-2 border-dashed border-line pb-4">
          {guessIndices.map((idx) => {
            const item = letters.find(it => it.i === idx);
            return (
              <button
                key={idx}
                onClick={() => removeLetter(idx)}
                className="pressable flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white font-display font-bold uppercase hover:bg-rose/5 hover:text-rose transition-colors"
              >
                {item?.l}
              </button>
            );
          })}
       </div>

       <div className="mt-6 flex flex-wrap justify-center gap-2">
          {letters.map((item) => {
            const used = guessIndices.includes(item.i);
            return (
              <button
                key={item.i}
                disabled={used}
                onClick={() => addLetter(item.i)}
                className={
                  "pressable h-10 w-10 rounded-lg flex items-center justify-center font-display font-bold uppercase transition-all " +
                  (used ? "bg-paper-2 text-ink/10 cursor-default" : "bg-paper-3 text-ink hover:bg-ink hover:text-paper")
                }
              >
                {item.l}
              </button>
            );
          })}
       </div>

       <div className="mt-8 flex gap-3">
          <button onClick={() => setGuessIndices([])} className="pressable flex-1 py-3 rounded-xl border-2 border-line font-bold text-ink-soft">Сбросить</button>
          <button onClick={submit} disabled={guessIndices.length === 0} className="pressable flex-[2] py-3 rounded-xl bg-ink text-white font-bold hover:bg-accent disabled:opacity-50">
             {checked ? (isCorrect ? "Дальше" : "Попробовать еще") : "Проверить"}
          </button>
       </div>
       {checked && (
         <motion.p initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`mt-4 text-sm font-bold ${isCorrect ? 'text-mint' : 'text-rose'}`}>
           {isCorrect ? "Правильно!" : `Неверно. Правильно: ${w.word}`}
         </motion.p>
       )}
    </Panel>
  );
}

/* ───── Open the Box ───── */
function OpenBoxView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);
  const [items] = useState(() => [...words].sort(() => Math.random() - 0.5).slice(0, 9));
  const [allOpened, setAllOpened] = useState<Set<number>>(new Set());

  const handleOpen = (idx: number) => {
    setOpenedIndex(idx);
    setAllOpened((prev) => new Set([...prev, idx]));
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
      {items.map((w, i) => {
        const isSelected = openedIndex === i;
        return (
          <button
            key={w.id}
            onClick={() => handleOpen(i)}
            className="pressable relative aspect-square group"
          >
            <AnimatePresence mode="wait">
              {!isSelected ? (
                <motion.div
                  key="closed"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.05, opacity: 0 }}
                  className={
                    "w-full h-full rounded-2xl flex flex-col items-center justify-center border-4 border-white shadow-lg transition-colors " +
                    (allOpened.has(i) ? "bg-paper-3 opacity-60" : "bg-ink")
                  }
                >
                  <span className={"font-display text-xl sm:text-2xl font-bold " + (allOpened.has(i) ? "text-ink/20" : "text-hl")}>
                    {i + 1}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="opened"
                  initial={{ scale: 1.1, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  className="w-full h-full bg-white border-2 border-accent rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center text-center shadow-inner"
                >
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest hidden sm:block">
                    Переведи:
                  </p>
                  <p className="mt-1 font-display text-sm sm:text-base font-bold leading-tight">
                    {w.word}
                  </p>
                  <p className="mt-1.5 text-[10px] sm:text-xs font-bold text-ink-soft line-clamp-2">
                    {w.translation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
      <div className="col-span-3 flex justify-center mt-6">
        <button
          onClick={onFinish}
          disabled={allOpened.size === 0}
          className="pressable rounded-2xl bg-ink px-10 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-accent disabled:opacity-30"
        >
          {allOpened.size === items.length ? "Готово!" : "Завершить практику"}
        </button>
      </div>
    </div>
  );
}

/* ───── Find the Match (Definition) ───── */
function MatchDefinitionView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const w = words[index];
  const options = useMemo(() => {
    const distractors = words.filter(item => item.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...distractors, w].sort(() => Math.random() - 0.5);
  }, [index, w, words]);

  const handlePick = (word: string) => {
    if (picked) return;
    setPicked(word);
    if (word === w.word) setCorrectCount(c => c + 1);
  };

  const next = () => {
    if (index === words.length - 1) setFinished(true);
    else { setIndex(i => i + 1); setPicked(null); }
  };

  if (finished) return (
    <Panel className="p-10 text-center">
       <Check className="mx-auto h-12 w-12 text-mint mb-4" />
       <h3 className="font-display text-xl font-bold">Завершено!</h3>
       <p className="text-sm font-bold text-ink-soft mt-2">{correctCount} из {words.length} верно</p>
       <button onClick={onFinish} className="pressable mt-6 rounded-2xl bg-ink px-8 py-3 text-sm font-bold text-paper">Готово</button>
    </Panel>
  );

  return (
    <Panel className="p-6">
       <p className="text-xs font-extrabold text-ink/40 uppercase">{index + 1} из {words.length}</p>
       <h3 className="mt-4 font-display text-xl font-bold leading-tight">"{w.definition}"</h3>
       <p className="mt-2 text-sm font-bold text-ink-soft/50">Найди подходящее слово:</p>
       
       <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {options.map(opt => {
            const isCorrect = opt.word === w.word;
            const isPicked = picked === opt.word;
            const state = !picked ? 'idle' : isCorrect ? 'right' : isPicked ? 'wrong' : 'dim';
            
            return (
              <button
                key={opt.id}
                onClick={() => handlePick(opt.word)}
                className={"pressable p-5 rounded-2xl border-2 text-left font-bold transition-all " + 
                  (state === 'idle' ? 'border-line hover:border-accent' : 
                   state === 'right' ? 'border-mint bg-mint/5 text-mint' : 
                   state === 'wrong' ? 'border-rose bg-rose/5 text-rose' : 'border-line opacity-40')}
              >
                 {opt.word}
              </button>
            );
          })}
       </div>

       {picked && (
         <button onClick={next} className="pressable mt-8 w-full py-4 rounded-2xl bg-ink text-white font-bold hover:bg-accent">
           {index === words.length - 1 ? "Завершить" : "Следующее"}
         </button>
       )}
    </Panel>
  );
}

/* ───── Memory Game ───── */
function MemoryView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const deck = useMemo(() => {
    const subset = words.slice(0, 6);
    return [...subset.map(w => ({ id: `${w.id}-en`, val: w.word, pairId: w.id, type: 'en' as const })),
            ...subset.map(w => ({ id: `${w.id}-tr`, val: w.translation, pairId: w.id, type: 'tr' as const }))]
            .sort(() => Math.random() - 0.5);
  }, [words]);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  const handleCard = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(deck[idx].pairId)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (deck[newFlipped[0]].pairId === deck[newFlipped[1]].pairId) {
        setMatched(m => [...m, deck[newFlipped[0]].pairId]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  if (matched.length === deck.length / 2) return (
    <Panel className="p-10 text-center">
       <Check className="mx-auto h-12 w-12 text-mint mb-4" />
       <h3 className="font-display text-xl font-bold">Отличная память!</h3>
       <button onClick={onFinish} className="pressable mt-6 rounded-2xl bg-ink px-8 py-3 text-sm font-bold text-paper">Готово</button>
    </Panel>
  );

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {deck.map((card, i) => {
        const isOpen = flipped.includes(i) || matched.includes(card.pairId);
        return (
          <button key={card.id} onClick={() => handleCard(i)} className="relative h-24 sm:h-32 [perspective:1000px]">
            <motion.div animate={{ rotateY: isOpen ? 180 : 0 }} transition={{ duration: 0.4 }} className="w-full h-full relative [transform-style:preserve-3d]">
              <div className="absolute inset-0 bg-paper-3 border-2 border-line rounded-xl flex items-center justify-center [backface-visibility:hidden]">
                 <div className="h-6 w-6 rounded-full border-2 border-ink/10" />
              </div>
              <div className="absolute inset-0 bg-white border-2 border-accent rounded-xl flex items-center justify-center p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                 <span className={"text-xs font-bold " + (card.type === 'en' ? 'text-accent' : 'text-mint')}>{card.val}</span>
              </div>
            </motion.div>
          </button>
        );
      })}
    </div>
  );
}

/* ───── Unjumble (Correct Order) ───── */
function UnjumbleView({ words, onFinish }: { words: VocabEntry[]; onFinish: () => void }) {
  const validWords = useMemo(() => words.filter((w) => w.example && w.example.split(" ").length > 2), [words]);
  const [index, setIndex] = useState(0);

  const w = validWords[index];
  const originalWords = useMemo(() => {
    if (!w) return [];
    return w.example.replace(/[.,!?]/g, "").split(" ").filter(Boolean);
  }, [w]);

  const [shuffled, setShuffled] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useMemo(() => {
    if (originalWords.length > 0) {
      setShuffled([...originalWords].sort(() => Math.random() - 0.5));
      setSelected([]);
    }
  }, [originalWords]);

  if (validWords.length === 0) {
    return (
      <Panel className="p-8 text-center">
        <p className="text-sm font-bold text-ink-soft">В этом наборе нет подходящих примеров для сборки предложений.</p>
        <button onClick={onFinish} className="pressable mt-5 rounded-2xl bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-accent">Назад</button>
      </Panel>
    );
  }

  const isLast = index === validWords.length - 1;
  const isCorrect = selected.join(" ").toLowerCase() === originalWords.join(" ").toLowerCase();
  const isFull = selected.length === originalWords.length;

  const toggleWord = (word: string, fromSelected: boolean) => {
    if (fromSelected) {
      setSelected((s) => s.filter((_, i) => i !== s.lastIndexOf(word)));
      setShuffled((s) => [...s, word]);
    } else {
      setShuffled((s) => s.filter((_, i) => i !== s.indexOf(word)));
      setSelected((s) => [...s, word]);
    }
  };

  const next = () => {
    if (isLast) onFinish();
    else setIndex((i) => i + 1);
  };

  return (
    <Panel className="p-6">
      <p className="text-xs font-extrabold text-ink/40 uppercase">{index + 1} из {validWords.length}</p>
      <h3 className="mt-2 font-display text-xl font-semibold">Собери оригинальный пример со словом "{w.word}"</h3>
      
      {/* Собранное предложение */}
      <div className="mt-6 flex min-h-16 flex-wrap gap-2 rounded-2xl border-2 border-dashed border-line/80 bg-paper-2/50 p-4">
        {selected.length === 0 && <span className="my-auto text-sm font-bold text-ink/30">Нажимай на слова ниже...</span>}
        {selected.map((word, i) => (
          <button
            key={`sel-${i}`}
            onClick={() => toggleWord(word, true)}
            className="pressable rounded-xl border border-line bg-white px-4 py-2 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Перемешанные слова */}
      <div className="mt-6 flex min-h-16 flex-wrap gap-2">
        {shuffled.map((word, i) => (
          <button
            key={`shuf-${i}`}
            onClick={() => toggleWord(word, false)}
            className="pressable rounded-xl bg-ink px-4 py-2 font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {word}
          </button>
        ))}
      </div>

      {isFull && (
        <div className="mt-6">
          <p className={`mb-4 text-sm font-semibold ${isCorrect ? "text-[#13683f]" : "text-rose"}`}>
            {isCorrect ? "Верно! Оригинал: " + w.example : "Где-то ошибка. Попробуй еще раз или подсмотри оригинальный пример."}
          </p>
          <button
            onClick={isCorrect ? next : () => { setShuffled([...originalWords].sort(() => Math.random() - 0.5)); setSelected([]); }}
            className="pressable w-full rounded-2xl bg-ink py-3.5 text-sm font-bold text-paper hover:bg-accent"
          >
            {isCorrect ? (isLast ? "Завершить" : "Следующее предложение") : "Сбросить"}
          </button>
        </div>
      )}
    </Panel>
  );
}

/* ═══════════════════════════════════ MAIN ═══════════════════════════════════ */

export default function LexisLab({
  customSets = [],
  onCreateSet,
  onAward,
}: {
  customSets?: import("../../data/vocabulary").LessonVocabSet[];
  onCreateSet?: () => void;
  onAward?: (pts: number) => void;
}) {
  const allSets = [...customSets, ...DEMO_VOCAB_SETS];
  const [selectedSetId, setSelectedSetId] = useState(allSets[0]?.id ?? DEMO_VOCAB_SETS[0].id);
  const [format, setFormat] = useState<LabFormat>("dictionary");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<WordCategory | "All">("All");

  const vocabSet = allSets.find((s) => s.id === selectedSetId) ?? allSets[0];

  const resetFormat = (pts?: number) => {
    if (pts && onAward) onAward(pts);
    setFormat("dictionary");
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Lexis Lab"
        hint="Все слова с урока в одном месте — учи через любой формат"
        action={
          onCreateSet ? (
            <button
              onClick={onCreateSet}
              className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-bold text-paper transition-colors hover:bg-accent"
            >
              <Plus className="h-4.5 w-4.5" />
              Новый набор слов
            </button>
          ) : undefined
        }
      />

      {/* Выбор набора слов */}
      <Panel className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {allSets.map((set) => (
              <button
                key={set.id}
                onClick={() => {
                  setSelectedSetId(set.id);
                  resetFormat();
                }}
                className={
                  "pressable relative inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-extrabold transition-colors " +
                  (selectedSetId === set.id ? "text-paper" : "bg-paper-2/70 text-ink-soft hover:text-ink")
                }
              >
                {selectedSetId === set.id && (
                  <motion.span
                    layoutId="lexis-set"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative">{set.title}</span>
                <span
                  className={
                    "relative rounded-full px-1.5 py-0.5 text-[10px] " +
                    (selectedSetId === set.id ? "bg-hl text-ink" : "bg-white text-ink/40")
                  }
                >
                  {set.level}
                </span>
              </button>
            ))}
          </div>

          {vocabSet.pdfName && (
            <span className="inline-flex items-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 text-xs font-extrabold text-ink-soft">
              <BookOpen className="h-4 w-4 text-accent" />
              {vocabSet.pdfName}
            </span>
          )}
        </div>
      </Panel>

      {/* Форматы */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {FORMAT_CARDS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFormat(f.id)}
            className={
              "pressable group flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 lg:flex-col lg:items-start lg:gap-2 " +
              (format === f.id
                ? "border-accent bg-accent/[.06] shadow-[0_14px_28px_-16px_rgba(108,77,246,.5)]"
                : "border-line bg-white hover:border-ink/25")
            }
          >
            <span
              className={
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:-rotate-6 " +
                (format === f.id ? "bg-accent text-white" : "bg-paper-2 text-ink-soft")
              }
            >
              <f.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[13px] font-extrabold">{f.title}</span>
              <span className="block text-[11px] font-semibold text-ink-soft/70">{f.text}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Фильтры словаря */}
      {format === "dictionary" && (
        <Panel className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
              {["All" as const, ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={
                    "pressable shrink-0 rounded-full px-3.5 py-2 text-[12px] font-extrabold transition-colors " +
                    (categoryFilter === cat
                      ? "bg-ink text-paper"
                      : "bg-paper-2/70 text-ink-soft hover:text-ink")
                  }
                >
                  {cat === "All" ? "Все" : cat}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Найти слово"
                className="w-full rounded-2xl border-2 border-line bg-paper/60 py-2.5 pr-4 pl-11 text-sm font-bold outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
              />
            </div>
          </div>
        </Panel>
      )}

      {/* Основной контент */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedSetId}-${format}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {format === "dictionary" && (
            <DictionaryView words={vocabSet.words} query={query} categoryFilter={categoryFilter} />
          )}
          {format === "quiz" && <QuizView words={vocabSet.words} onFinish={() => resetFormat(40)} />}
          {format === "flashcards" && <FlashView words={vocabSet.words} onFinish={() => resetFormat(30)} />}
          {format === "match" && <MatchView words={vocabSet.words} onFinish={() => resetFormat(40)} />}
          {format === "group-sort" && <GroupSortView words={vocabSet.words} onFinish={() => resetFormat(40)} />}
          {format === "complete" && <CompleteView words={vocabSet.words} onFinish={() => resetFormat(50)} />}
          {format === "unjumble" && <UnjumbleView words={vocabSet.words} onFinish={() => resetFormat(50)} />}
          {format === "anagram" && <AnagramView words={vocabSet.words} onFinish={() => resetFormat(50)} />}
          {format === "open-box" && <OpenBoxView words={vocabSet.words} onFinish={() => resetFormat(30)} />}
          {format === "match-definition" && <MatchDefinitionView words={vocabSet.words} onFinish={() => resetFormat(40)} />}
          {format === "wheel" && <WheelView words={vocabSet.words} onFinish={() => resetFormat(20)} />}
          {format === "memory" && <MemoryView words={vocabSet.words} onFinish={() => resetFormat(40)} />}
        </motion.div>
      </AnimatePresence>

      <Panel className="border-dashed bg-paper-2/45 p-5">
        <p className="text-[13px] font-semibold text-ink-soft">
          <b className="font-extrabold">Lexis Lab</b> — все слова с урока собраны в одном месте.
          Выбери набор, открой любой формат и практикуйся в удобном темпе.
        </p>
      </Panel>
    </div>
  );
}
