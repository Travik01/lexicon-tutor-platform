import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleAlert, Layers, PartyPopper, PenLine, UserRound, Zap } from "lucide-react";
import { LESSONS, type Lesson } from "../data/lessons";
import type { Assignment } from "../data/mock";
import { Reveal, SectionTag, Squiggle } from "./Reveal";

function findLessonByCode(code: string): Lesson | null {
  const builtIn = LESSONS.find((item) => item.code.toUpperCase() === code);
  if (builtIn) return builtIn;
  try {
    const assignments = JSON.parse(localStorage.getItem("ch2-assignments") ?? "[]") as Assignment[];
    return (
      assignments.find(
        (assignment) => assignment.code.toUpperCase() === code && assignment.customLesson
      )?.customLesson ?? null
    );
  } catch {
    return null;
  }
}

export default function Join({
  onLogin,
  onStart,
}: {
  onLogin?: () => void;
  onStart?: (lessonId: string) => void;
}) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "error" | "found">("idle");
  const [shake, setShake] = useState(0);
  const [foundLesson, setFoundLesson] = useState<Lesson | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const lesson = findLessonByCode(normalizedCode);
    if (!lesson) {
      setFoundLesson(null);
      setState("error");
      setShake((s) => s + 1);
      return;
    }
    setFoundLesson(lesson);
    setState("found");
  };

  return (
    <section id="join" className="relative scroll-mt-24 px-5 py-8 sm:px-8">
      <div className="grid-paper mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-line bg-paper-2/60">
        <div className="grid items-center gap-12 p-8 sm:p-14 lg:grid-cols-2">
          {/* Текст */}
          <div>
            <Reveal>
              <SectionTag rotate={-1}>Получили код от учителя?</SectionTag>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="relative mt-6 font-display text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.06] font-bold tracking-tight">
                Код — это бонус,
                <br />
                а не пропуск.
                <Squiggle className="mt-3 h-[11px] w-44" color="#6c4df6" />
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-md text-lg leading-relaxed font-medium text-ink-soft">
                Код открывает задания, которые подготовил именно твой учитель. А всё остальное
                доступно свободно: любая категория и любой формат — в любой момент.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {[
                  { icon: Zap, t: "квизы" },
                  { icon: Layers, t: "карточки" },
                  { icon: PenLine, t: "задачи и аудио" },
                ].map((f) => (
                  <span
                    key={f.t}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 py-2 text-xs font-extrabold text-ink-soft"
                  >
                    <f.icon className="h-4 w-4 text-accent" />
                    {f.t} — свободно
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Форма */}
          <Reveal delay={0.15}>
            <div className="relative rounded-[28px] border border-line bg-white p-7 shadow-[0_30px_60px_-28px_rgba(27,23,18,0.3)] sm:p-9">
              <form onSubmit={submit} noValidate>
                <label
                  htmlFor="join-code"
                  className="text-xs font-extrabold tracking-[0.18em] text-ink/45 uppercase"
                >
                  Код задания
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <motion.div
                    key={shake}
                    animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                    transition={{ duration: 0.45 }}
                    className="flex-1"
                  >
                    <input
                      id="join-code"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setFoundLesson(null);
                        if (state !== "idle") setState("idle");
                      }}
                      placeholder="LONDON-42"
                      maxLength={12}
                      autoComplete="off"
                      className={
                        "code-input w-full rounded-2xl border-2 bg-paper/60 px-5 py-4 font-display text-lg font-semibold transition-all outline-none focus:bg-white " +
                        (state === "error"
                          ? "border-rose focus:ring-4 focus:ring-rose/15"
                          : "border-line focus:border-accent focus:ring-4 focus:ring-accent/15")
                      }
                    />
                  </motion.div>
                  <button
                    type="submit"
                    className="pressable group inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-7 py-4 font-display text-sm font-bold text-paper transition-colors hover:bg-accent"
                  >
                    Начать
                    <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {state === "error" && (
                    <motion.p
                      key="err"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 flex items-center gap-1.5 text-sm font-bold text-rose"
                    >
                      <CircleAlert className="h-4 w-4" />
                      Такого кода пока нет. Для проверки попробуй LONDON-42
                    </motion.p>
                  )}
                  {state === "found" && foundLesson && (
                    <motion.div
                      key="found"
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                      className="mt-4 rounded-2xl border border-mint/30 bg-[#f0fbf5] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-extrabold text-[#13683f]">
                            <PartyPopper className="h-4.5 w-4.5" />
                            Задание найдено
                          </p>
                          <p className="mt-1 text-sm font-bold text-ink-soft">
                            «{foundLesson.title}» · {foundLesson.format}, {foundLesson.questions.length}{" "}
                            упражнений · ≈ {foundLesson.duration} минут
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onStart?.(foundLesson.id)}
                          className="pressable shrink-0 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-extrabold text-paper transition-colors hover:bg-accent"
                        >
                          Начать задание
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <div className="my-6 flex items-center gap-4">
                <span className="h-px flex-1 bg-line" />
                <span className="text-sm font-semibold text-ink/30">или</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <button
                onClick={onLogin}
                className="pressable flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-ink/10 px-6 py-3.5 text-[15px] font-bold transition-colors hover:border-ink/30 hover:bg-paper/70"
              >
                <UserRound className="h-4.5 w-4.5 text-accent" />
                Войти как преподаватель
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
