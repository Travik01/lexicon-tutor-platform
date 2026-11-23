import { Asterisk, BookOpen, Layers, Repeat, Trophy } from "lucide-react";
import { Reveal } from "./Reveal";

const TOPICS = [
  "Present Perfect",
  "Phrasal verbs",
  "Аудирование",
  "Эссе",
  "Irregular verbs",
  "Устная часть",
  "Лексика ЕГЭ",
  "Articles",
  "Говорение",
  "Conditionals",
  "Идиомы",
  "Письмо другу",
];

const STATS = [
  { icon: Layers, value: "12 000+", label: "заданий по английскому" },
  { icon: BookOpen, value: "200+", label: "упражнений в библиотеке" },
  { icon: Trophy, value: "11", label: "форматов практики" },
  { icon: Repeat, value: "∞", label: "попыток без штрафа" },
];

export default function StatsBand() {
  return (
    <section className="relative -rotate-1 overflow-hidden border-y border-ink bg-ink text-paper">
      <div className="grid-paper-dark absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
        {/* Бегущая строка тем */}
        <div
          className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          aria-hidden
        >
          <div className="animate-marquee flex w-max items-center gap-8 pr-8">
            {[...TOPICS, ...TOPICS].map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-8 font-display text-2xl font-medium tracking-tight whitespace-nowrap text-paper/70 sm:text-3xl"
              >
                {s}
                <Asterisk className="h-5 w-5 text-hl" />
              </span>
            ))}
          </div>
        </div>

        {/* Цифры */}
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="group flex flex-col gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper/10 text-hl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                  {s.value}
                </p>
                <p className="text-sm font-semibold text-paper/60">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
