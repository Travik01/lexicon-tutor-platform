import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Mic,
  Pause,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import type { Lesson } from "../../data/lessons";

export type LessonResult = {
  lessonId: string;
  score: number;
  total: number;
  points: number;
};

type LessonDraft = {
  index: number;
  picked: number | null;
  value: string;
  checked: boolean;
  correct: number;
  finished: boolean;
  flipped: boolean;
  known: number;
  showPassage: boolean;
};

const draftKey = (lessonId: string) => `ch2-lesson-draft:${lessonId}`;

function readDraft(lesson: Lesson): LessonDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(lesson.id));
    if (!raw) return null;
    const draft = JSON.parse(raw) as LessonDraft;
    if (draft.index < 0 || draft.index >= lesson.questions.length) return null;
    return draft;
  } catch {
    return null;
  }
}

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[.!?,;:]+$/g, "")
    .replace(/\s+/g, " ");

export default function AssignmentPlayer({
  lesson,
  onClose,
  onComplete,
}: {
  lesson: Lesson;
  onClose: () => void;
  onComplete: (result: LessonResult) => void;
}) {
  const [initialDraft] = useState(() => readDraft(lesson));
  const [index, setIndex] = useState(initialDraft?.index ?? 0);
  const [picked, setPicked] = useState<number | null>(initialDraft?.picked ?? null);
  const [value, setValue] = useState(initialDraft?.value ?? "");
  const [checked, setChecked] = useState(initialDraft?.checked ?? false);
  const [correct, setCorrect] = useState(initialDraft?.correct ?? 0);
  const [finished, setFinished] = useState(initialDraft?.finished ?? false);
  const [flipped, setFlipped] = useState(initialDraft?.flipped ?? false);
  const [known, setKnown] = useState(initialDraft?.known ?? 0);
  const [showPassage, setShowPassage] = useState(
    initialDraft?.showPassage ?? lesson.format !== "Аудирование"
  );
  const [speaking, setSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);

  // Для Audio Response
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recordInterval = useRef<number | null>(null);

  const question = lesson.questions[index];
  const isCards = lesson.format === "Карточки";
  const isOpen = !question?.options && !question?.answers && !question?.answer;
  const isLast = index === lesson.questions.length - 1;
  const total = lesson.questions.length;
  const currentScore = isCards ? known : correct;
  const points = Math.max(10, currentScore * (lesson.level === "ЕГЭ" ? 20 : 10));

  const inputCorrect = useMemo(() => {
    if (!question?.answers) return false;
    return question.answers.map(normalize).includes(normalize(value));
  }, [question, value]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === " " && isCards && !finished) {
        event.preventDefault();
        setFlipped((state) => !state);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.speechSynthesis?.cancel();
      if (recordInterval.current) window.clearInterval(recordInterval.current);
    };
  }, [finished, isCards, onClose]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordInterval.current) window.clearInterval(recordInterval.current);
      setValue("audio-recorded"); // Mock value to mark as answered
    } else {
      setIsRecording(true);
      setRecordTime(0);
      setValue("");
      recordInterval.current = window.setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    }
  };

  // Автосохранение черновика
  useEffect(() => {
    const draft: LessonDraft = {
      index,
      picked,
      value,
      checked,
      correct,
      finished,
      flipped,
      known,
      showPassage,
    };
    try {
      localStorage.setItem(draftKey(lesson.id), JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [checked, correct, finished, flipped, index, known, lesson.id, picked, showPassage, value]);

  const speakPassage = () => {
    if (!lesson.passage || !("speechSynthesis" in window)) return;
    if (speaking && !speechPaused) {
      window.speechSynthesis.pause();
      setSpeechPaused(true);
      return;
    }
    if (speaking && speechPaused) {
      window.speechSynthesis.resume();
      setSpeechPaused(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lesson.passage);
    utterance.lang = "en-GB";
    utterance.rate = 0.88;
    utterance.onend = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setSpeechPaused(false);
  };

  const moveNext = (wasCorrect: boolean) => {
    const nextScore = correct + (wasCorrect ? 1 : 0);
    if (wasCorrect) setCorrect(nextScore);
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((position) => position + 1);
    setPicked(null);
    setValue("");
    setChecked(false);
    setFlipped(false);
  };

  const choose = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
  };

  const submitChoice = () => {
    if (picked === null || question.correct == null) return;
    moveNext(picked === question.correct);
  };

  const submitInput = () => {
    if (!value.trim()) return;
    if (!checked) {
      setChecked(true);
      return;
    }
    moveNext(inputCorrect);
  };

  const submitOpen = () => {
    if (!value.trim()) return;
    moveNext(true);
  };

  const markCard = (didKnow: boolean) => {
    const nextKnown = known + (didKnow ? 1 : 0);
    if (didKnow) setKnown(nextKnown);
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((position) => position + 1);
    setFlipped(false);
  };

  const restart = () => {
    try {
      localStorage.removeItem(draftKey(lesson.id));
    } catch {
      /* ignore */
    }
    setIndex(0);
    setPicked(null);
    setValue("");
    setChecked(false);
    setCorrect(0);
    setKnown(0);
    setFinished(false);
    setFlipped(false);
  };

  const finishLesson = () => {
    try {
      localStorage.removeItem(draftKey(lesson.id));
    } catch {
      /* ignore */
    }
    onComplete({
      lessonId: lesson.id,
      score: currentScore,
      total,
      points,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-ink/60 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Задание: ${lesson.title}`}
    >
      <button onClick={onClose} className="absolute inset-0 cursor-default" aria-label="Закрыть задание" />

      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_70px_140px_-48px_rgba(0,0,0,.7)]"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line/80 px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onClose}
              className="pressable grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-ink/55 transition-colors hover:border-ink/30 hover:text-ink"
              aria-label="Вернуться к заданиям"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold sm:text-base">{lesson.title}</p>
              <p className="text-[11px] font-bold text-ink/40">
                {lesson.format} · {lesson.level} · {lesson.duration} минут
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {(index > 0 || picked !== null || value || finished) && (
              <button
                onClick={restart}
                className="pressable grid h-8 w-8 place-items-center rounded-lg text-ink/35 transition-colors hover:bg-paper-2 hover:text-ink"
                aria-label="Начать занятие заново"
                title="Начать заново"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="font-display text-xs font-bold text-ink-soft tabular-nums">
              {finished ? `${currentScore}/${total}` : `${index + 1}/${total}`}
            </span>
          </div>
        </header>

        <div className="h-1.5 bg-paper-2">
          <motion.div
            className="h-full rounded-r-full bg-accent"
            animate={{ width: `${(finished ? 1 : index / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-4 text-center"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.55 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-hl text-ink"
                >
                  <Sparkles className="h-9 w-9" />
                </motion.span>
                <h2 className="mt-5 font-display text-2xl font-bold">Занятие завершено</h2>
                <p className="mt-2 text-sm font-semibold text-ink-soft">
                  {isOpen
                    ? `Готовы все ${total} развёрнутых ответа.`
                    : `Результат: ${currentScore} из ${total}. Начислено ${points} баллов.`}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={restart}
                    className="pressable inline-flex items-center gap-2 rounded-2xl border-2 border-ink/12 px-5 py-3 text-sm font-bold transition-colors hover:border-ink/30"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Пройти заново
                  </button>
                  <button
                    onClick={finishLesson}
                    className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-7 py-3.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
                  >
                    <Check className="h-4 w-4" />
                    Сохранить результат
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`${lesson.id}-${index}`}
                initial={{ opacity: 0, x: 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {lesson.instruction && (
                  <div className="mb-5 rounded-2xl border border-accent/20 bg-accent/[.05] px-4 py-3 text-[13px] leading-relaxed font-semibold text-accent-deep">
                    {lesson.instruction}
                  </div>
                )}

                {lesson.passage && (
                  <div className="mb-6 overflow-hidden rounded-2xl border border-line bg-paper/60">
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <button
                        onClick={() => setShowPassage((state) => !state)}
                        className="pressable inline-flex items-center gap-2 text-xs font-extrabold text-ink-soft"
                      >
                        <BookOpen className="h-4 w-4 text-accent" />
                        {lesson.format === "Аудирование" ? "Транскрипт" : "Текст задания"}
                        <ChevronDown className={`h-4 w-4 transition-transform ${showPassage ? "rotate-180" : ""}`} />
                      </button>
                      {lesson.format === "Аудирование" && (
                        <button
                          onClick={speakPassage}
                          className="pressable inline-flex items-center gap-1.5 rounded-full bg-sky/10 px-3 py-1.5 text-[11px] font-extrabold text-[#2b5cb8]"
                        >
                          {speaking && !speechPaused ? <Pause className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                          {speaking && !speechPaused ? "Пауза" : speechPaused ? "Продолжить" : "Прослушать"}
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {showPassage && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="whitespace-pre-line border-t border-line/70 px-4 py-4 text-sm leading-relaxed font-medium text-ink-soft"
                        >
                          {lesson.passage}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {isCards ? (
                  <div>
                    <button
                      onClick={() => setFlipped((state) => !state)}
                      className="relative block h-64 w-full [perspective:1000px]"
                      aria-label={flipped ? "Показан ответ" : "Показано слово"}
                    >
                      <motion.span
                        animate={{ rotateY: flipped ? 180 : 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="relative block h-full w-full [transform-style:preserve-3d]"
                      >
                        <span className="grid-paper absolute inset-0 flex flex-col items-center justify-center rounded-[24px] border-2 border-line bg-paper px-6 [backface-visibility:hidden]">
                          <span className="font-display text-3xl font-bold text-center">{question.prompt}</span>
                          <span className="mt-3 text-xs font-bold text-ink/30">Нажми на карточку или пробел</span>
                        </span>
                        <span className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px] bg-accent px-6 text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                          <span className="font-display text-2xl font-bold">{question.answer}</span>
                          <span className="mt-3 text-sm font-semibold text-white/75">{question.example}</span>
                        </span>
                      </motion.span>
                    </button>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button onClick={() => markCard(false)} className="pressable rounded-2xl border-2 border-rose/30 bg-rose/5 py-3.5 text-sm font-extrabold text-rose hover:bg-rose/10">
                        Ещё повторю
                      </button>
                      <button onClick={() => markCard(true)} className="pressable rounded-2xl bg-mint py-3.5 text-sm font-extrabold text-white hover:bg-[#178a58]">
                        Знаю
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-extrabold tracking-[0.18em] text-ink/40 uppercase">
                      {isOpen ? "Развёрнутый ответ" : question.options ? "Выбери ответ" : "Введи ответ"}
                    </p>
                    <h2 className="mt-2 font-display text-xl leading-snug font-semibold sm:text-2xl">
                      {question.prompt}
                    </h2>

                    {question.options ? (
                      <div className="mt-5 space-y-2.5">
                        {question.options.map((option, optionIndex) => {
                          const revealed = picked !== null;
                          const state = !revealed
                            ? "idle"
                            : optionIndex === question.correct
                              ? "right"
                              : optionIndex === picked
                                ? "wrong"
                                : "dim";
                          return (
                            <button
                              key={option}
                              onClick={() => choose(optionIndex)}
                              className={
                                "pressable flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] font-bold transition-all " +
                                (state === "idle" ? "border-line bg-paper/60 hover:border-ink/35 hover:bg-white" : "") +
                                (state === "right" ? " border-mint bg-[#eafaf1]" : "") +
                                (state === "wrong" ? " border-rose bg-rose/[.06]" : "") +
                                (state === "dim" ? " border-line opacity-45" : "")
                              }
                            >
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink/[.06] font-display text-[11px]">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              {option}
                            </button>
                          );
                        })}
                        {picked !== null && (
                          <div
                            className={
                              "mt-4 rounded-2xl border px-4 py-3 text-sm leading-relaxed font-semibold " +
                              (picked === question.correct
                                ? "border-mint/25 bg-[#f0fbf5] text-[#13683f]"
                                : "border-rose/25 bg-rose/[.06] text-rose")
                            }
                          >
                            <b>{picked === question.correct ? "Верно. " : "Не совсем. "}</b>
                            {question.explanation}
                          </div>
                        )}
                        <button
                          onClick={submitChoice}
                          disabled={picked === null}
                          className="pressable mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-bold text-paper transition-colors enabled:hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          {isLast ? "К результату" : "Следующий вопрос"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : isOpen ? (
                      <div className="mt-5">
                        {lesson.format === "Говорение" ? (
                          <div className="flex flex-col items-center justify-center py-6">
                            {!value ? (
                              <>
                                <button
                                  onClick={toggleRecording}
                                  className={`pressable relative flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                                    isRecording ? "bg-rose text-white shadow-[0_0_0_8px_rgba(244,63,94,0.2)] animate-pulse" : "bg-accent text-white shadow-xl hover:bg-accent-deep"
                                  }`}
                                >
                                  {isRecording ? <Square className="h-8 w-8 fill-current" /> : <Mic className="h-8 w-8" />}
                                </button>
                                <p className="mt-4 text-sm font-bold tabular-nums text-ink-soft">
                                  {isRecording ? `0:${String(recordTime).padStart(2, "0")}` : "Нажмите, чтобы записать ответ"}
                                </p>
                              </>
                            ) : (
                              <div className="w-full flex items-center gap-4 bg-paper-2/50 p-4 rounded-2xl border border-line">
                                <button
                                  onClick={() => setValue("")}
                                  className="h-10 w-10 shrink-0 bg-white text-ink border border-line rounded-full flex items-center justify-center hover:bg-ink/5"
                                  title="Перезаписать"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                                <div className="h-2 flex-1 bg-paper-3 rounded-full overflow-hidden">
                                  <div className="h-full bg-accent w-1/3" />
                                </div>
                                <span className="text-xs font-bold tabular-nums text-ink-soft">0:15 / 0:{String(recordTime || 15).padStart(2, "0")}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <textarea
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            rows={lesson.format === "Письмо" ? 11 : 5}
                            placeholder="Напиши ответ здесь…"
                            className="w-full resize-y rounded-2xl border-2 border-line bg-paper/60 px-4 py-3.5 text-sm leading-relaxed font-semibold outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
                          />
                        )}
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-ink/40">
                          <span>{lesson.format === "Письмо" ? `${value.trim() ? value.trim().split(/\s+/).length : 0} слов` : ""}</span>
                          <span>{lesson.format === "Говорение" ? "Запись сохраняется" : "Проверь себя после ответа"}</span>
                        </div>
                        {value.trim() && question.explanation && (
                          <div className="mt-3 rounded-2xl bg-paper-2/70 px-4 py-3 text-sm font-semibold text-ink-soft">
                            <b>Проверь себя:</b> {question.explanation}
                          </div>
                        )}
                        <button
                          onClick={submitOpen}
                          disabled={!value.trim()}
                          className="pressable mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-bold text-paper transition-colors enabled:hover:bg-accent disabled:opacity-30"
                        >
                          <Send className="h-4 w-4" />
                          {isLast ? "Завершить" : "Сохранить и дальше"}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-5">
                        <input
                          value={value}
                          onChange={(event) => {
                            setValue(event.target.value);
                            setChecked(false);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") submitInput();
                          }}
                          placeholder="Введите английское слово или фразу"
                          autoComplete="off"
                          className={
                            "w-full rounded-2xl border-2 bg-paper/60 px-4 py-3.5 font-display text-base font-semibold outline-none transition-all focus:bg-white focus:ring-4 " +
                            (checked
                              ? inputCorrect
                                ? "border-mint focus:ring-mint/15"
                                : "border-rose focus:ring-rose/15"
                              : "border-line focus:border-accent focus:ring-accent/15")
                          }
                        />
                        {checked && (
                          <div className={`mt-3 rounded-2xl px-4 py-3 text-sm font-semibold ${inputCorrect ? "bg-[#f0fbf5] text-[#13683f]" : "bg-rose/[.06] text-rose"}`}>
                            <b>{inputCorrect ? "Верно. " : `Правильный ответ: ${question.answers?.[0]}. `}</b>
                            {question.explanation}
                          </div>
                        )}
                        <button
                          onClick={submitInput}
                          disabled={!value.trim()}
                          className="pressable mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-bold text-paper transition-colors enabled:hover:bg-accent disabled:opacity-30"
                        >
                          {checked ? (isLast ? "К результату" : "Следующий вопрос") : "Проверить"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </motion.div>
  );
}