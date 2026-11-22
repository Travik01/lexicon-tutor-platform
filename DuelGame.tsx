import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Crown, RotateCcw, Swords, Timer } from "lucide-react";
import oli from "../../assets/mascot-oli.png";

const ROUND_SECONDS = 10;

const ROUNDS = [
  { en: "ambitious", options: ["скромный", "амбициозный", "упрямый"], correct: 1 },
  { en: "to envy", options: ["ненавидеть", "прощать", "завидовать"], correct: 2 },
  { en: "wit", options: ["глупость", "остроумие", "усталость"], correct: 1 },
  { en: "to belong", options: ["принадлежать", "верить", "вести себя"], correct: 0 },
  { en: "major", options: ["мелкий", "временный", "главный"], correct: 2 },
  { en: "to release", options: ["удерживать", "выпустить", "отказать"], correct: 1 },
  { en: "pale", options: ["бледный", "розовый", "пухлый"], correct: 0 },
  { en: "courage", options: ["трусость", "забота", "смелость"], correct: 2 },
  { en: "to struggle", options: ["стараться изо всех сил", "душить", "гулять"], correct: 0 },
  { en: "however", options: ["однако", "когда бы ни", "кто бы ни"], correct: 0 },
];

type Phase = "intro" | "play" | "end";

export type DuelOutcome = "win" | "tie" | "lose";

export default function DuelGame({
  onClose,
  onFinish,
}: {
  onClose: () => void;
  onFinish?: (points: number, outcome: DuelOutcome) => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // -1 = время вышло
  const [myScore, setMyScore] = useState(0);
  const [oliScore, setOliScore] = useState(0);
  const [myGain, setMyGain] = useState(0);
  const [oliGain, setOliGain] = useState(0);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const advance = useRef<number | null>(null);

  const r = ROUNDS[round];
  const isLast = round === ROUNDS.length - 1;

  // Esc + блокировка фона
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (advance.current) window.clearTimeout(advance.current);
    };
  }, [onClose]);

  // Таймер раунда
  useEffect(() => {
    if (phase !== "play" || picked !== null) return;
    const id = window.setInterval(() => setSeconds((s) => Math.max(s - 1, 0)), 1000);
    return () => window.clearInterval(id);
  }, [phase, picked, round]);

  // Время вышло
  useEffect(() => {
    if (phase === "play" && picked === null && seconds === 0) resolve(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  // Автопереход после ответа
  useEffect(() => {
    if (phase !== "play" || picked === null) return;
    advance.current = window.setTimeout(() => {
      if (isLast) {
        setPhase("end");
        return;
      }
      setPicked(null);
      setRound((i) => i + 1);
      setSeconds(ROUND_SECONDS);
    }, 1500);
    return () => {
      if (advance.current) window.clearTimeout(advance.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, phase]);

  const resolve = (i: number) => {
    if (picked !== null) return;
    const mine = i === r.correct ? 10 + (seconds >= 7 ? 5 : 0) : 0;
    const his = Math.random() < 0.78 ? 10 + Math.floor(Math.random() * 6) : 0;
    setPicked(i);
    setMyGain(mine);
    setOliGain(his);
    setMyScore((s) => s + mine);
    setOliScore((s) => s + his);
  };

  const restart = () => {
    setPhase("play");
    setRound(0);
    setPicked(null);
    setMyScore(0);
    setOliScore(0);
    setMyGain(0);
    setOliGain(0);
    setSeconds(ROUND_SECONDS);
  };

  const won = myScore > oliScore;
  const tie = myScore === oliScore;

  const scoreChip = (label: string, score: number, gain: number, accent: boolean) => (
    <div
      className={
        "relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 " +
        (accent ? "border-accent/30 bg-accent/5" : "border-line bg-paper/70")
      }
    >
      <span className="text-xs font-extrabold text-ink/45">{label}</span>
      <motion.span
        key={score}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="font-display text-lg font-bold tabular-nums"
      >
        {score}
      </motion.span>
      <AnimatePresence>
        {gain > 0 && picked !== null && (
          <motion.span
            key={`g-${score}-${gain}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-extrabold text-mint"
          >
            +{gain}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Игра-дуэль: бой со словами против Оли"
    >
      <button className="absolute inset-0 h-full w-full cursor-default" onClick={onClose} aria-label="Закрыть" />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_60px_120px_-40px_rgba(0,0,0,0.6)]"
      >
        {/* Шапка */}
        <div className="flex items-center justify-between gap-3 border-b border-line/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="pressable grid h-8 w-8 place-items-center rounded-lg border border-line text-ink/50 transition-colors hover:border-ink/30 hover:text-ink"
              aria-label="Вернуться в кабинет"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-ink-soft/80 uppercase">
              <Swords className="h-4 w-4 text-tangerine" />
              {phase === "play" ? `Раунд ${round + 1} из ${ROUNDS.length}` : "Дуэль с Оли"}
            </p>
          </div>
          {phase === "play" && (
            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-bold tabular-nums " +
                (seconds <= 3 ? "bg-rose/10 text-rose" : "bg-paper-2 text-ink-soft")
              }
            >
              <Timer className="h-3.5 w-3.5" />
              {seconds} с
            </span>
          )}
        </div>

        <div className="px-6 pt-6 pb-7 sm:px-8">
          <AnimatePresence mode="wait">
            {/* Заставка */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="py-2 text-center"
              >
                <motion.img
                  src={oli}
                  alt="Лисёнок Оли — твой соперник"
                  initial={{ rotate: -6, scale: 0.85 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="mx-auto h-28 w-28 rounded-3xl border border-line object-cover ring-4 ring-tangerine/30"
                />
                <h3 className="mt-4 font-display text-2xl font-bold">
                  Дуэль со словами
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed font-semibold text-ink-soft">
                  10 слов, 10 секунд на каждое. Верный ответ — 10 очков, быстрый ответ (7+ секунд в
                  запасе) — бонус +5. Всё, что заработаешь, Оли зачислит тебе в баллы.
                </p>
                <button
                  onClick={() => setPhase("play")}
                  className="pressable mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-ink px-8 py-4 text-base font-bold text-paper transition-colors hover:bg-tangerine"
                >
                  <Swords className="h-5 w-5" />
                  Принять вызов
                </button>
              </motion.div>
            )}

            {/* Игра */}
            {phase === "play" && (
              <motion.div
                key={`round-${round}`}
                initial={{ opacity: 0, x: 26 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -26 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Счёт */}
                <div className="flex items-center justify-between gap-2">
                  {scoreChip("Ты", myScore, myGain, true)}
                  <img
                    src={oli}
                    alt="Оли"
                    className="h-11 w-11 shrink-0 rounded-full border border-line object-cover"
                  />
                  {scoreChip("Оли", oliScore, oliGain, false)}
                </div>

                {/* Таймер-полоса */}
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-2">
                  <motion.div
                    className={"h-full rounded-full " + (seconds <= 3 ? "bg-rose" : "bg-mint")}
                    initial={false}
                    animate={{ width: `${(seconds / ROUND_SECONDS) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <p className="mt-6 text-center text-xs font-extrabold tracking-[0.2em] text-ink/40 uppercase">
                  Переведи слово
                </p>
                <p className="mt-1 text-center font-display text-3xl font-bold tracking-tight">
                  {r.en}
                </p>

                <div className="mt-6 space-y-2.5">
                  {r.options.map((opt, i) => {
                    const state =
                      picked === null
                        ? "idle"
                        : i === r.correct
                          ? "right"
                          : i === picked
                            ? "wrong"
                            : "dim";
                    return (
                      <button
                        key={opt}
                        onClick={() => resolve(i)}
                        disabled={picked !== null}
                        className={
                          "pressable w-full rounded-2xl border-2 px-5 py-3.5 text-center text-[15px] font-bold tracking-wide transition-all duration-300 " +
                          (state === "idle" &&
                            "border-line bg-paper/60 hover:-translate-y-0.5 hover:border-ink/40 hover:bg-white") +
                          (state === "right" && " border-mint bg-[#eafaf1]") +
                          (state === "wrong" && " border-rose bg-[#fdf0f4]") +
                          (state === "dim" && " border-line/70 opacity-45")
                        }
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Итог раунда */}
                <div className="mt-4 min-h-[26px] text-center">
                  <AnimatePresence>
                    {picked !== null && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[13px] font-extrabold"
                      >
                        {picked === -1 ? (
                          <span className="text-rose">Время вышло!</span>
                        ) : picked === r.correct ? (
                          <span className="text-mint">
                            {myGain === 15 ? "Быстро! +15" : "Верно! +10"}
                          </span>
                        ) : (
                          <span className="text-rose">Мимо.</span>
                        )}{" "}
                        <span className="text-ink/45">
                          {oliGain > 0 ? `Оли +${oliGain}` : "Оли ошибся"}
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Финал */}
            {phase === "end" && (
              <motion.div
                key="end"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="py-3 text-center"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -6 }}
                  transition={{ type: "spring", bounce: 0.55 }}
                  className={
                    "mx-auto grid h-20 w-20 place-items-center rounded-3xl " +
                    (won ? "bg-hl text-ink" : "bg-paper-2 text-ink/50")
                  }
                >
                  <Crown className="h-10 w-10" />
                </motion.span>
                <h3 className="mt-4 font-display text-2xl font-bold">
                  {won ? "Победа!" : tie ? "Ничья!" : "Поражение"}
                </h3>
                <p className="mt-1 font-display text-lg font-semibold text-ink-soft tabular-nums">
                  {myScore} : {oliScore}
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed font-semibold text-ink-soft">
                  {`Результат: ${myScore} ${myScore === 1 ? "балл" : myScore < 5 ? "балла" : "баллов"}`}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={restart}
                    className="pressable inline-flex items-center gap-2 rounded-2xl border-2 border-ink/12 px-5 py-3 text-sm font-bold transition-colors hover:border-ink/30"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Реванш
                  </button>
                  <button
                    onClick={() =>
                      onFinish
                        ? onFinish(myScore, won ? "win" : tie ? "tie" : "lose")
                        : onClose()
                    }
                    className="pressable rounded-2xl bg-ink px-7 py-3.5 text-sm font-bold text-paper transition-colors hover:bg-tangerine"
                  >
                    Забрать баллы
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
