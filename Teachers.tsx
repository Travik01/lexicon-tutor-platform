import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  FileText,
  Scissors,
  Send,
  Shapes,
  Wand2,
} from "lucide-react";
import { Reveal, SectionTag, Squiggle } from "./Reveal";

const STEPS = [
  {
    icon: FileText,
    title: "Добавьте материал",
    text: "Тема, список слов или определения",
  },
  {
    icon: Shapes,
    title: "Выберите подачу",
    text: "Квиз, карточки, блиц или задачи",
  },
  {
    icon: Send,
    title: "Отправьте код",
    text: "Ответы учеников появятся в кабинете",
  },
];

function CodeTicket() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("LONDON-42");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard недоступен — честно не показываем «скопировано»
    }
  };

  return (
    <motion.div
      style={{ ["--float-rotate" as string]: "2deg" }}
      className="animate-float relative rotate-2 rounded-[24px] border border-white/10 bg-ink p-7 text-paper shadow-[0_36px_70px_-28px_rgba(27,23,18,0.65)]"
    >
      <div className="grid-paper-dark pointer-events-none absolute inset-0 rounded-[24px]" aria-hidden />
      <p className="relative text-[11px] font-extrabold tracking-[0.22em] text-paper/50 uppercase">
        Код задания
      </p>
      <div className="relative mt-2 flex items-center justify-between gap-4">
        <strong className="font-display text-3xl font-bold tracking-[0.08em] text-hl sm:text-4xl">
          LONDON-42
        </strong>
        <button
          onClick={copy}
          className="pressable inline-flex h-11 w-11 items-center justify-center rounded-xl border border-paper/20 bg-paper/10 transition-colors hover:bg-paper/20"
          aria-label={copied ? "Скопировано" : "Скопировать код"}
        >
          {copied ? <Check className="h-4.5 w-4.5 text-mint" /> : <Copy className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Линия отреза */}
      <div className="relative mt-6 flex items-center gap-3">
        <div className="ticket-edge flex-1" style={{ filter: "invert(1)", opacity: 0.5 }} />
        <Scissors className="h-4 w-4 -rotate-90 text-paper/40" />
      </div>

      <p className="relative mt-4 text-sm font-semibold text-paper/60">
        {copied ? "Скопировано — можно отправлять классу" : "Ученик вводит код — и сразу внутри задания"}
      </p>
    </motion.div>
  );
}

export default function Teachers({ onLogin }: { onLogin?: () => void }) {
  return (
    <section id="teachers" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
        {/* Текст и шаги */}
        <div>
          <Reveal>
            <SectionTag rotate={1.5}>Учителям</SectionTag>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[1.08] font-bold tracking-tight">
              Тема превращается
              <br />
              <span className="text-accent">в урок</span> за пару минут
              <Squiggle className="mt-3 h-[11px] w-56" color="#ff8a3d" />
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed font-medium text-ink-soft">
              Добавьте термины или тему, напишите короткое пожелание и выберите формат. Мы соберём
              задание и выдадим код для класса.
            </p>
          </Reveal>

          <ol className="mt-10 space-y-1">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={0.1 + i * 0.09}>
                <li className="group flex items-center gap-5 rounded-2xl p-3 transition-colors hover:bg-white">
                  <span className="relative grid h-13 w-13 shrink-0 place-items-center rounded-2xl border border-line bg-white font-display text-lg font-bold text-ink shadow-[3px_4px_0_rgba(27,23,18,0.07)] transition-transform duration-300 group-hover:-rotate-6">
                    {i + 1}
                    <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-lg bg-paper-2 text-ink-soft">
                      <s.icon className="h-3.5 w-3.5" />
                    </span>
                  </span>
                  <div>
                    <p className="text-[16px] font-extrabold">{s.title}</p>
                    <p className="text-sm font-medium text-ink-soft">{s.text}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.4}>
            <button
              onClick={onLogin}
              className="pressable group mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-accent px-7 py-4 text-base font-bold text-white shadow-[0_22px_44px_-16px_rgba(108,77,246,0.65)] transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
            >
              <Wand2 className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
              Создать задание
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>

        {/* Карточки урока */}
        <Reveal delay={0.2} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative">
            <CodeTicket />
            <div className="relative z-10 -mt-3 -rotate-1 rounded-[24px] border border-line bg-white p-6 shadow-[0_30px_60px_-28px_rgba(27,23,18,0.4)]">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold tracking-[0.18em] text-ink/40 uppercase">
                    Тема урока
                  </span>
                </p>
                <span className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-6 rounded-full ${i === 0 ? "bg-accent" : "bg-paper-3"}`}
                    />
                  ))}
                </span>
              </div>
              <p className="mt-2 font-display text-lg font-semibold">Present Perfect</p>
              <p className="mt-1 text-sm font-bold text-ink-soft">Квиз · 8 вопросов</p>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-paper-2/70 px-4 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-white">
                  <Check className="h-4.5 w-4.5" strokeWidth={3} />
                </span>
                <p className="text-[13px] leading-snug font-bold text-ink-soft">
                  24 из 28 учеников уже прошли задание
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
