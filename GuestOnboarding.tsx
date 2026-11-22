import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  GraduationCap,
  Sparkles,
  Trophy,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "../../components/Header";
import ezhi from "../../assets/mascot-ezhi.png";
import oli from "../../assets/mascot-oli.png";

export type GuestGoal = "ege" | "olympiad" | "general";
export type GuestLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "unknown";

export type GuestProfile = {
  name: string;
  goal: GuestGoal;
  level: GuestLevel;
};

export const PROFILE_KEY = "ch2-guest-profile";

export const GOAL_LABELS: Record<GuestGoal, string> = {
  ege: "ЕГЭ",
  olympiad: "Олимпиады",
  general: "Английский для жизни",
};

const GOALS: {
  id: GuestGoal;
  title: string;
  text: string;
  icon: LucideIcon;
  color: string;
  mascot?: string;
}[] = [
  {
    id: "ege",
    title: "Сдать ЕГЭ",
    text: "Экзаменационные форматы, письменная и устная части",
    icon: GraduationCap,
    color: "bg-accent text-white",
    mascot: ezhi,
  },
  {
    id: "olympiad",
    title: "Готовиться к олимпиадам",
    text: "Сложная лексика, чтение и нестандартные задания",
    icon: Trophy,
    color: "bg-tangerine text-white",
    mascot: oli,
  },
  {
    id: "general",
    title: "Английский для жизни",
    text: "Слова, грамматика, аудирование и уверенная речь",
    icon: Compass,
    color: "bg-sky text-white",
  },
];

const LEVELS: { id: GuestLevel; title: string; text: string }[] = [
  { id: "A1", title: "A1 Beginner", text: "Только начинаю учить язык" },
  { id: "A2", title: "A2 Elementary", text: "Понимаю простые фразы и темы" },
  { id: "B1", title: "B1 Intermediate", text: "Могу общаться и читать тексты" },
  { id: "B2", title: "B2 Upper-Int", text: "Понимаю сложные тексты и говорю" },
  { id: "C1", title: "C1 Advanced", text: "Свободно владею языком" },
  { id: "unknown", title: "Не знаю", text: "Начнём с B1 и подстроимся" },
];

export default function GuestOnboarding({
  initial,
  onComplete,
}: {
  initial?: GuestProfile | null;
  onComplete: (profile: GuestProfile) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(initial ? 2 : 1);
  const [name, setName] = useState(initial?.name ?? "");
  const [goal, setGoal] = useState<GuestGoal>(initial?.goal ?? "general");
  const [level, setLevel] = useState<GuestLevel>(initial?.level ?? "unknown");

  const complete = () => {
    if (!name.trim()) return;
    onComplete({ name: name.trim(), goal, level });
  };

  const skip = () => {
    onComplete({ name: "Ученик", goal: "general", level: "unknown" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-paper p-4 sm:p-7"
      role="dialog"
      aria-modal="true"
      aria-label="Настройка учебного маршрута"
    >
      <div className="grid-paper absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/15 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute -right-28 -bottom-32 h-96 w-96 rounded-full bg-hl/35 blur-[120px]" aria-hidden />

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto w-full max-w-3xl overflow-hidden rounded-[30px] border border-line bg-white shadow-[0_50px_100px_-40px_rgba(27,23,18,.45)]"
      >
        <header className="flex items-center justify-between border-b border-line/70 px-6 py-4 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((number) => (
              <span
                key={number}
                className={
                  "h-2 rounded-full transition-all duration-300 " +
                  (step === number ? "w-8 bg-accent" : "w-2 bg-paper-3")
                }
              />
            ))}
          </div>
        </header>

        <div className="p-6 sm:p-9">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-extrabold text-accent-deep">
                  <UserRound className="h-4 w-4" />
                  знакомство
                </span>
                <h1 className="mt-5 font-display text-2xl leading-tight font-bold sm:text-3xl">
                  Как тебя зовут?
                </h1>
                <p className="mt-2 text-sm leading-relaxed font-semibold text-ink-soft">
                  Представься, чтобы мы могли персонализировать твой личный кабинет.
                </p>

                <div className="mt-8">
                  <label htmlFor="guest-name" className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                    Твоё имя
                  </label>
                  <input
                    id="guest-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Александр"
                    autoComplete="off"
                    className="mt-2 w-full rounded-2xl border-2 border-line bg-paper/60 px-5 py-4 font-display text-lg font-semibold transition-all outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
                  />
                </div>

                <div className="mt-10 flex items-center justify-between gap-4">
                  <button
                    onClick={skip}
                    className="text-sm font-bold text-ink/35 hover:text-ink transition-colors"
                  >
                    Пропустить
                  </button>
                  <button
                    onClick={() => name.trim() && setStep(2)}
                    disabled={!name.trim()}
                    className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-8 py-4 text-base font-extrabold text-paper transition-all hover:bg-accent disabled:opacity-40"
                  >
                    Дальше
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="goal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-extrabold text-accent-deep">
                  <Sparkles className="h-4 w-4" />
                  цель обучения
                </span>
                <h1 className="mt-5 font-display text-2xl leading-tight font-bold sm:text-3xl">
                  Для чего тебе английский?
                </h1>

                <div className="mt-7 grid gap-3 md:grid-cols-3">
                  {GOALS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setGoal(item.id)}
                      className={
                        "pressable relative flex min-h-48 flex-col rounded-[22px] border-2 p-5 text-left transition-all " +
                        (goal === item.id
                          ? "border-accent bg-accent/[.05] shadow-[0_18px_36px_-24px_rgba(108,77,246,.55)]"
                          : "border-line bg-paper/45 hover:border-ink/25 hover:bg-white")
                      }
                    >
                      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span className="mt-5 text-[15px] font-extrabold">{item.title}</span>
                      <span className="mt-1 text-xs leading-relaxed font-semibold text-ink-soft/70">
                        {item.text}
                      </span>
                      {goal === item.id && (
                        <span className="absolute right-3 bottom-3 grid h-7 w-7 place-items-center rounded-full bg-accent text-white">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <button onClick={() => setStep(1)} className="pressable text-sm font-bold text-ink/50 hover:text-ink">
                    Назад
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-7 py-3.5 text-sm font-extrabold text-paper transition-colors hover:bg-accent"
                  >
                    Дальше
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="level"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-mint/10 px-3 py-1.5 text-xs font-extrabold text-[#13683f]">
                  <BookOpen className="h-4 w-4" />
                  последний шаг
                </span>
                <h1 className="mt-5 font-display text-2xl leading-tight font-bold sm:text-3xl">
                  Какой у тебя уровень сейчас?
                </h1>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {LEVELS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLevel(item.id)}
                      className={
                        "pressable flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all " +
                        (level === item.id
                          ? "border-accent bg-accent/[.05]"
                          : "border-line bg-paper/45 hover:border-ink/25 hover:bg-white")
                      }
                    >
                      <span
                        className={
                          "grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-sm font-bold " +
                          (level === item.id ? "bg-accent text-white" : "bg-paper-3 text-ink-soft")
                        }
                      >
                        {item.id === "unknown" ? "?" : item.id}
                      </span>
                      <span>
                        <span className="block text-[14px] font-extrabold">{item.title}</span>
                        <span className="mt-0.5 block text-xs font-semibold text-ink-soft/70">{item.text}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="pressable inline-flex items-center gap-2 text-sm font-bold text-ink/50 hover:text-ink"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Назад
                  </button>
                  <button
                    onClick={complete}
                    className="pressable inline-flex items-center gap-2 rounded-2xl bg-ink px-7 py-3.5 text-sm font-extrabold text-paper transition-colors hover:bg-accent"
                  >
                    Готово
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </motion.div>
  );
}
