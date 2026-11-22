import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleQuestion, Plus } from "lucide-react";
import { Reveal, SectionTag, Squiggle } from "./Reveal";

const ITEMS = [
  {
    q: "Нужно ли регистрироваться, чтобы попробовать?",
    a: "Нет. Введи код задания от учителя — и ты сразу внутри, без пароля и почты. А если зарегистрируешься, результаты сохранятся, серия дней будет расти, а учитель увидит твои ответы.",
  },
  {
    q: "Подойдёт ли Чистовик, если я готовлюсь к ЕГЭ с нуля?",
    a: "Да. Темы разбиты на уровни от A1 до C1. После каждого занятия видно, где ошибки — в грамматике, аудировании или эссе — и можно сфокусироваться именно на этом.",
  },
  {
    q: "Как учитель видит ответы класса?",
    a: "Учитель создаёт задание и получает код вида LONDON-42. Как только ученик проходит квиз, результат появляется в кабинете: кто выполнил, с каким баллом и на каких темах споткнулся класс.",
  },
  {
    q: "Можно ли заниматься с телефона?",
    a: "Конечно. Квизы и карточки отлично проходятся по дороге в школу — одно занятие занимает 5–10 минут. Прогресс синхронизируется между телефоном и компьютером.",
  },
  {
    q: "Что будет, если пропустить день?",
  },
];

const ANSWER_LAST =
  "Ничего страшного — серия обнулится, но прогресс и выученные слова останутся. Заниматься можно в любом темпе, попытки не ограничены.";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Левая колонка */}
        <div>
          <Reveal>
            <SectionTag rotate={-1.5}>Вопросы–ответы</SectionTag>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-6 font-display text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[1.08] font-bold tracking-tight">
              Спрашивают
              <br />
              <span className="text-accent">перед стартом</span>
              <Squiggle className="mt-3 h-[11px] w-52" color="#ff8a3d" />
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-lg leading-relaxed font-medium text-ink-soft">
              Собрали то, о чём чаще всего спрашивают ученики и учителя. Не нашёл свой вопрос —
              напиши нам.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <a
              href="mailto:privet@chistovik.app"
              className="pressable mt-8 inline-flex items-center gap-2.5 rounded-2xl border-2 border-ink/12 bg-white/80 px-6 py-3.5 text-[15px] font-bold transition-all hover:border-ink/35"
            >
              <MessageCircleQuestion className="h-5 w-5 text-accent" />
              Задать свой вопрос
            </a>
          </Reveal>
        </div>

        {/* Аккордеон */}
        <div className="space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            const answer = item.a ?? ANSWER_LAST;
            return (
              <Reveal key={item.q} delay={i * 0.06}>
                <div
                  className={
                    "overflow-hidden rounded-[22px] border transition-all duration-300 " +
                    (isOpen
                      ? "border-accent/40 bg-white shadow-[0_24px_48px_-26px_rgba(108,77,246,0.45)]"
                      : "border-line bg-white/70 hover:border-ink/25 hover:bg-white")
                  }
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[15px] leading-snug font-extrabold sm:text-base">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className={
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors " +
                        (isOpen
                          ? "border-accent bg-accent text-white"
                          : "border-ink/15 text-ink-soft")
                      }
                    >
                      <Plus className="h-4 w-4" strokeWidth={3} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-6 pb-6 text-[15px] leading-relaxed font-medium text-ink-soft">
                          {answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
