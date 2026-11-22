import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, Check, Flame, Sparkles, Star, X } from "lucide-react";
import { Reveal, SectionTag, Squiggle } from "./Reveal";

type QuizQuestion = {
  subject: string;
  accent: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const QUESTIONS: QuizQuestion[] = [
  {
    subject: "Лексика",
    accent: "#6c4df6",
    topic: "Слово дня · уровень B1",
    question: "Как переводится слово «achievement»?",
    options: ["соглашение", "достижение", "разочарование"],
    correct: 1,
    explanation: "Achievement — достижение. А disappointment — как раз разочарование.",
  },
  {
    subject: "Грамматика",
    accent: "#3e7bfa",
    topic: "Present Perfect · B1",
    question: "I ___ never been to London.",
    options: ["has", "have", "had"],
    correct: 1,
    explanation: "С местоимением I всегда have: I have never been to London.",
  },
  {
    subject: "Phrasal verbs",
    accent: "#f2547d",
    topic: "Фразовые глаголы · B1",
    question: "«Look after» — это…",
    options: ["искать", "выглядеть как", "присматривать за"],
    correct: 2,
    explanation: "Look after — присматривать. А искать — look for.",
  },
];

const LETTERS = ["А", "Б", "В"];

function QuizCard() {
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(0);

  const q = QUESTIONS[qIndex];
  const answered = picked !== null;
  const isRight = answered && picked === q.correct;
  const progress = Math.min((7 + solved) / 10, 1);

  const pick = (i: number) => {
    if (answered) return;
    setPicked(i);
  };

  const next = () => {
    setPicked(null);
    setSolved((s) => s + 1);
    setQIndex((i) => (i + 1) % QUESTIONS.length);
  };

  return (
    <div className="relative" aria-label="Пример интерактивного задания">
      {/* Стикеры-награды */}
      <motion.div
        style={{ ["--float-rotate" as string]: "-6deg" }}
        initial={{ opacity: 0, scale: 0.6, rotate: -14 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.6, type: "spring", bounce: 0.5 }}
        className="animate-float absolute -top-5 -left-4 z-20 rounded-2xl border border-ink/10 bg-mint px-4 py-2 text-sm font-extrabold text-white shadow-[0_14px_30px_-10px_rgba(31,163,107,0.7)] sm:-left-8"
      >
        +120 очков
      </motion.div>
      <motion.div
        style={{ ["--float-rotate" as string]: "5deg" }}
        initial={{ opacity: 0, scale: 0.6, rotate: 12 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.05, duration: 0.6, type: "spring", bounce: 0.5 }}
        className="animate-float absolute -right-3 -bottom-5 z-20 inline-flex items-center gap-1.5 rounded-2xl border border-ink/10 bg-hl px-4 py-2 text-sm font-extrabold text-ink shadow-[0_14px_30px_-12px_rgba(242,183,5,0.8)] [animation-delay:1.2s] sm:-right-6"
      >
        <Flame className="h-4 w-4 fill-tangerine text-tangerine" />
        Серия: 7 дней
      </motion.div>

      {/* Подложка-«стопка карточек» */}
      <div className="absolute inset-0 translate-x-3 translate-y-4 -rotate-2 rounded-[28px] border border-line bg-paper-2" aria-hidden />

      <div className="relative overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_40px_80px_-32px_rgba(27,23,18,0.35)]">
        {/* Шапка карточки */}
        <div className="flex items-center justify-between gap-3 border-b border-line/80 px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={q.subject}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-full px-3 py-1 text-xs font-extrabold text-white"
              style={{ background: q.accent }}
            >
              {q.subject}
            </motion.span>
          </AnimatePresence>
          <span className="font-display text-xs font-semibold text-ink-soft tabular-nums">
            {7 + solved} / {10 + solved}
          </span>
        </div>

        {/* Прогресс */}
        <div className="h-1.5 w-full bg-paper-2">
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: isRight ? "#1fa36b" : q.accent }}
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="px-6 pt-5 pb-6 sm:px-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={qIndex}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-bold tracking-wide text-ink-soft/80 uppercase">
                {q.topic}
              </p>
              <h3 className="mt-2 font-display text-lg leading-snug font-semibold sm:text-[21px]">
                {q.question}
              </h3>

              <div className="mt-5 space-y-2.5">
                {q.options.map((opt, i) => {
                  const state = !answered
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
                      disabled={answered}
                      className={
                        "pressable flex w-full items-center gap-3.5 rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-300 " +
                        (state === "idle" &&
                          "border-line bg-paper/60 hover:-translate-y-0.5 hover:border-ink/40 hover:bg-white hover:shadow-[0_10px_24px_-12px_rgba(27,23,18,0.35)]") +
                        (state === "right" &&
                          " border-mint bg-[#eafaf1] shadow-[0_12px_28px_-14px_rgba(31,163,107,0.7)]") +
                        (state === "wrong" && " border-rose bg-[#fdf0f4]") +
                        (state === "dim" && " border-line/70 opacity-45")
                      }
                    >
                      <span
                        className={
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display text-xs font-bold transition-colors " +
                          (state === "right"
                            ? "bg-mint text-white"
                            : state === "wrong"
                              ? "bg-rose text-white"
                              : "bg-ink/6 text-ink-soft")
                        }
                      >
                        {state === "right" ? (
                          <Check className="h-4 w-4" strokeWidth={3.5} />
                        ) : state === "wrong" ? (
                          <X className="h-4 w-4" strokeWidth={3.5} />
                        ) : (
                          LETTERS[i]
                        )}
                      </span>
                      <span className="text-[15px] font-bold tracking-wide">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Пояснение */}
              <div className="mt-4 min-h-[76px]">
                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.35 }}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-mint/30 bg-[#f0fbf5] px-4 py-3"
                    >
                      <p className="text-sm leading-relaxed text-[#13683f]">
                        <b className="font-extrabold">{isRight ? "Верно! " : "Почти! "}</b>
                        {q.explanation}
                      </p>
                      <button
                        onClick={next}
                        className="pressable mt-0.5 shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold text-paper transition-colors hover:bg-accent"
                      >
                        Ещё вопрос
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const AVATARS = [
  { t: "АК", c: "bg-accent" },
  { t: "М", c: "bg-tangerine" },
  { t: "СБ", c: "bg-sky" },
  { t: "+2к", c: "bg-ink" },
];

export default function Hero() {
  // Лёгкий параллакс карточки за курсором
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [3.5, -3.5]), {
    stiffness: 140,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-3.5, 3.5]), {
    stiffness: 140,
    damping: 18,
  });

  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section id="top" className="grid-paper relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Мягкие цветные пятна фона */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-accent/15 blur-[120px]" aria-hidden />
      <div className="pointer-events-none absolute top-40 -right-32 h-[420px] w-[420px] rounded-full bg-hl/45 blur-[130px]" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Левая колонка */}
        <div>
          <Reveal>
            <SectionTag>Английский, который не бесит</SectionTag>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-7 font-display text-[clamp(2.3rem,5.8vw,4.2rem)] leading-[1.04] font-bold tracking-tight">
              Английский так,
              <br />
              как{" "}
              <span className="relative inline-block">
                <em className="text-accent not-italic">удобно тебе.</em>
                <Squiggle className="absolute -bottom-3 left-0 h-[14px] w-full sm:-bottom-4" color="#ff8a3d" />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed font-medium text-ink-soft sm:text-xl">
              Готовься к ЕГЭ и олимпиадам через квизы, карточки, аудирование и игры. Все форматы
              — в одной платформе.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <a
                href="#directions"
                className="pressable group inline-flex items-center gap-2.5 rounded-2xl bg-ink px-7 py-4 text-base font-bold text-paper shadow-[0_22px_44px_-16px_rgba(27,23,18,0.55)] transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-[0_26px_50px_-16px_rgba(108,77,246,0.7)]"
              >
                Начать учиться
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#join"
                className="pressable inline-flex items-center gap-2.5 rounded-2xl border-2 border-ink/12 bg-white/80 px-7 py-[15px] text-base font-bold text-ink backdrop-blur transition-all hover:-translate-y-0.5 hover:border-ink/35 hover:bg-white"
              >
                <Sparkles className="h-4.5 w-4.5 text-accent" />
                У меня есть код
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <p className="mt-5 text-sm font-semibold text-ink-soft/60">
              Все задания доступны сразу — код нужен только для заданий учителя
            </p>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2.5">
                {AVATARS.map((a) => (
                  <span
                    key={a.t}
                    className={`grid h-10 w-10 place-items-center rounded-full text-[11px] font-extrabold text-white ring-[3px] ring-paper ${a.c}`}
                  >
                    {a.t}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <b className="text-[15px] font-extrabold">4,9 из 5</b>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="star-mask h-3.5 w-3.5 fill-current" strokeWidth={0} />
                    ))}
                  </span>
                </div>
                <small className="text-xs font-semibold text-ink-soft/80">
                  по оценкам учеников
                </small>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Правая колонка: живой квиз */}
        <Reveal delay={0.2} className="relative">
          <p className="pointer-events-none absolute -top-8 right-2 z-10 text-xs font-bold text-ink-soft/50 select-none">
            попробуй ответить ↓
          </p>
          <motion.div
            onMouseMove={onTilt}
            onMouseLeave={() => {
              mx.set(0);
              my.set(0);
            }}
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
          >
            <QuizCard />
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
