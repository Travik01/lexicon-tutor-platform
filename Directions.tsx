import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, ListChecks, MessagesSquare, Sparkles, Timer, Trophy } from "lucide-react";
import { Reveal, SectionTag, Squiggle } from "./Reveal";
import ezhi from "../assets/mascot-ezhi.png";
import oli from "../assets/mascot-oli.png";

const CARDS = [
  {
    icon: Trophy,
    mascot: ezhi,
    mascotName: "Эжи",
    tag: "ЕГЭ по английскому",
    title: "Сдать экзамен на 90+",
    text: "Все четыре части — письменная и устная — с разбором по критериям ФИПИ. Видишь, где теряешь баллы, и закрываешь именно это.",
    features: [
      { icon: ListChecks, t: "Задания из банка ФИПИ актуального года" },
      { icon: Timer, t: "Пробники на время, как на настоящем экзамене" },
      { icon: BadgeCheck, t: "Эссе и письмо: шаблоны + разбор каждой ошибки" },
    ],
    chips: ["Говорение", "Аудирование", "Эссе 37–40", "Лексика"],
    chipCls: "bg-accent/8 text-accent-deep border-accent/20",
    iconCls: "bg-accent text-white",
    btnHover: "hover:bg-accent",
    cta: "Выбрать тему",
    rotate: "-1deg",
  },
  {
    icon: MessagesSquare,
    mascot: oli,
    mascotName: "Оли",
    tag: "Олимпиады и жизнь",
    title: "Английский, которым пользуешься",
    text: "От Всероша и перечневых олимпиад до сериалов без субтитров — практика, после которой язык не вылетает из головы.",
    features: [
      { icon: ListChecks, t: "Задачи олимпиад прошлых лет с подсказками" },
      { icon: Timer, t: "Разговорные темы день за днём — без зубрёжки" },
      { icon: BadgeCheck, t: "Слова из сериалов, подкастов и игр" },
    ],
    chips: ["Всерош", "Разговорный", "Аудио", "Идиомы"],
    chipCls: "bg-tangerine/10 text-[#b3541a] border-tangerine/25",
    iconCls: "bg-tangerine text-white",
    btnHover: "hover:bg-tangerine",
    cta: "Попробовать формат",
    rotate: "1deg",
  },
];

export default function Directions() {
  return (
    <section id="directions" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <SectionTag rotate={1}>Выбери направление</SectionTag>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.08] font-bold tracking-tight">
              Один язык —
              <br />
              <span className="relative inline-block">
                две большие цели
                <Squiggle className="absolute -bottom-2.5 left-0 h-[11px] w-full" color="#6c4df6" />
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg leading-relaxed font-medium text-ink-soft">
              Можно готовиться к экзамену по плану или просто закрыть пробел в конкретной теме.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {CARDS.map((c, idx) => (
            <Reveal key={c.tag} delay={idx * 0.12}>
              <article
                style={{ rotate: c.rotate }}
                className="group relative flex h-full flex-col rounded-[28px] border border-line bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_36px_70px_-30px_rgba(27,23,18,0.35)] sm:p-9"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`grid h-13 w-13 place-items-center rounded-2xl ${c.iconCls} shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105`}
                  >
                    <c.icon className="h-6 w-6" />
                  </span>
                  <motion.img
                    src={c.mascot}
                    alt={`Маскот ${c.mascotName}`}
                    whileHover={{ rotate: 6, scale: 1.06 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="-mt-9 -mr-5 h-26 w-26 rotate-3 rounded-full border border-line object-cover shadow-[0_20px_40px_-20px_rgba(27,23,18,0.45)] ring-4 ring-paper"
                  />
                </div>

                <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-ink-soft/70">
                  {c.tag}
                </p>
                <h3 className="mt-2 font-display text-[26px] leading-tight font-semibold tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed font-medium text-ink-soft">
                  {c.text}
                </p>

                <ul className="mt-6 space-y-3">
                  {c.features.map((f) => (
                    <li key={f.t} className="flex items-center gap-3">
                      <f.icon className="h-4.5 w-4.5 shrink-0 text-ink/45" />
                      <span className="text-sm font-semibold text-ink-soft">{f.t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap gap-2 pt-2">
                  {c.chips.map((chip) => (
                    <span
                      key={chip}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${c.chipCls}`}
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <p className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-paper-2/70 px-4 py-2.5 text-[13px] font-bold text-ink-soft">
                  <Sparkles className="h-4 w-4 shrink-0 text-tangerine" />
                  {c.mascotName} начисляет баллы за выполненные задания
                </p>

                <a
                  href="#join"
                  className={`pressable mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-bold text-paper transition-all hover:gap-3 ${c.btnHover}`}
                >
                  {c.cta}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-dashed border-ink/25 bg-paper-2/60 px-7 py-6">
            <p className="text-[15px] font-semibold text-ink-soft">
              А можно и{" "}
              <span className="hl hl-mint font-bold text-ink">без большой цели</span> — просто
              подтянуть грамматику к четверти.
            </p>
            <a
              href="#join"
              className="pressable inline-flex items-center gap-2 text-sm font-extrabold text-accent-deep underline decoration-accent/40 decoration-2 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              Закрыть пробел по теме
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
