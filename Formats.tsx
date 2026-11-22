import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Layers, PenLine, Repeat2, Swords, Zap } from "lucide-react";
import { Reveal, SectionTag } from "./Reveal";

/* --- Растягивающаяся карточка-формат --- */
function FormatShell({
  children,
  className = "",
  rotate = "0deg",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
}) {
  return (
    <div
      style={{ rotate }}
      className={`group flex h-full flex-col rounded-[28px] border border-line bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-30px_rgba(27,23,18,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

/* --- Переворачивающаяся карточка --- */
function FlipCard() {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((v) => !v)}
      className="relative mt-auto h-36 w-full [perspective:900px]"
      aria-live="polite"
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Лицевая сторона */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-accent/25 bg-accent/5 px-4 text-center [backface-visibility:hidden]">
          <p className="font-display text-sm font-semibold text-accent-deep">supposed to</p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink/40">
            <Repeat2 className="h-3.5 w-3.5" />
            нажми, чтобы перевернуть
          </span>
        </div>
        {/* Обратная сторона */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-accent px-4 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-[13px] leading-snug font-bold text-white">
            Полагается, предполагается
          </p>
          <p className="text-[11px] font-semibold text-white/70">
            I'm supposed to finish it today.
          </p>
        </div>
      </motion.div>
    </button>
  );
}

/* --- Дуэль --- */
function Duel() {
  return (
    <div className="mt-auto space-y-3 pt-5">
      <div>
        <div className="mb-1.5 flex justify-between text-xs font-bold">
          <span>Ты</span>
          <span className="text-mint">840</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-paper-2">
          <motion.div
            className="h-full rounded-full bg-mint"
            initial={{ width: "12%" }}
            whileInView={{ width: "84%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-xs font-bold text-ink-soft">
          <span>Максим из 10 «А»</span>
          <span>610</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-paper-2">
          <motion.div
            className="h-full rounded-full bg-ink/25"
            initial={{ width: "8%" }}
            whileInView={{ width: "61%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <p className="pt-1 text-center text-[11px] font-extrabold tracking-wide text-mint uppercase">
        Ты впереди на 230 очков
      </p>
    </div>
  );
}

/* --- Задачи-чеклист --- */
function TaskList() {
  const [done, setDone] = useState<boolean[]>([true, false, false]);
  const tasks = [
    "Выучить 15 новых слов",
    "Пройти аудирование 6–10",
    "Написать письмо другу по плану",
  ];
  return (
    <div className="mt-auto space-y-2 pt-5">
      {tasks.map((t, i) => (
        <button
          key={t}
          onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
          className="pressable flex w-full items-center gap-3 rounded-xl border border-line/80 bg-paper/60 px-3.5 py-2.5 text-left transition-colors hover:bg-white"
        >
          <span
            className={
              "grid h-5.5 w-5.5 shrink-0 place-items-center rounded-md border-2 transition-all duration-300 " +
              (done[i] ? "border-mint bg-mint" : "border-ink/25 bg-white")
            }
          >
            {done[i] && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />}
          </span>
          <span
            className={
              "text-[13px] font-bold transition-all duration-300 " +
              (done[i] ? "text-ink/40 line-through decoration-2" : "text-ink-soft")
            }
          >
            {t}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Formats() {
  return (
    <section id="formats" className="relative scroll-mt-24 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          {/* Заголовок — часть сетки */}
          <div className="flex flex-col justify-center rounded-[28px] md:col-span-6 lg:col-span-3 lg:pr-10">
            <Reveal>
              <SectionTag rotate={-1.5}>Не только тесты</SectionTag>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-6 font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.1] font-bold tracking-tight">
                Меняй формат,
                <br />
                а <span className="hl hl-violet font-bold">не цель</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-md text-lg leading-relaxed font-medium text-ink-soft">
                Сегодня — быстрый квиз в автобусе. Завтра — серьёзный набор задач за столом.
                Результаты сохраняются автоматически.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-8 text-sm font-semibold text-ink-soft/50">
                Каждый формат можно попробовать прямо сейчас
              </p>
            </Reveal>
          </div>

          {/* Квизы */}
          <Reveal className="md:col-span-6 lg:col-span-3" delay={0.1}>
            <FormatShell rotate="0.8deg">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-hl text-ink">
                  <Zap className="h-5.5 w-5.5" />
                </span>
                <span className="rounded-full bg-ink/5 px-3 py-1 text-[11px] font-extrabold tracking-wide text-ink-soft uppercase">
                  5–10 минут
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">Квизы</h3>
              <p className="mt-2 text-sm leading-relaxed font-medium text-ink-soft">
                Быстрые проверки слов и грамматики. Каждый ответ — с объяснением, а серия дней
                превращает английский в привычку.
              </p>
              {/* Визуал: сетка ответов */}
              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 + i * 0.035, type: "spring", bounce: 0.5 }}
                      className={
                        "grid h-7 w-7 place-items-center rounded-lg text-[10px] font-extrabold " +
                        (i < 6
                          ? "bg-mint text-white"
                          : i === 6
                            ? "bg-rose text-white"
                            : "bg-paper-2 text-ink/30")
                      }
                    >
                      {i < 6 ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : i + 1}
                    </motion.span>
                  ))}
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold">8 вопросов</p>
                  <p className="text-xs font-bold text-ink-soft/70">≈ 4 минуты</p>
                </div>
              </div>
            </FormatShell>
          </Reveal>

          {/* Карточки */}
          <Reveal className="md:col-span-3 lg:col-span-2" delay={0.05}>
            <FormatShell rotate="-1.2deg" className="max-md:col-span-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-white">
                <Layers className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">Карточки</h3>
              <p className="mt-2 text-sm leading-relaxed font-medium text-ink-soft">
                Слова и фразы с интервальным повторением — забыть сложно.
              </p>
              <FlipCard />
            </FormatShell>
          </Reveal>

          {/* Игры */}
          <Reveal className="md:col-span-3 lg:col-span-2" delay={0.1}>
            <FormatShell rotate="0.6deg" className="max-md:col-span-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-tangerine text-white">
                <Swords className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">Игры и дуэли</h3>
              <p className="mt-2 text-sm leading-relaxed font-medium text-ink-soft">
                Соревнуйся с одноклассниками и поднимайся в рейтинге класса.
              </p>
              <Duel />
            </FormatShell>
          </Reveal>

          {/* Задачи */}
          <Reveal className="md:col-span-3 lg:col-span-2" delay={0.15}>
            <FormatShell rotate="-0.6deg" className="max-md:col-span-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky text-white">
                <PenLine className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">Задачи</h3>
              <p className="mt-2 text-sm leading-relaxed font-medium text-ink-soft">
                Аудирование, эссе и письма — с пошаговым разбором по критериям.
              </p>
              <TaskList />
            </FormatShell>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
