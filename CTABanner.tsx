import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Reveal, SectionTag, Squiggle } from "./Reveal";

export default function CTABanner({ onTryDemo }: { onTryDemo?: () => void }) {
  return (
    <section id="cta" className="relative scroll-mt-24 px-5 pt-16 pb-24 sm:px-8 sm:pt-24 sm:pb-32">
      <Reveal>
        <div className="relative mx-auto max-w-7xl -rotate-1 overflow-hidden rounded-[36px] border border-white/10 bg-ink px-6 py-16 text-center text-paper sm:border-ink sm:px-8 sm:py-24 lg:-rotate-[1.2deg]">
          <div className="grid-paper-dark pointer-events-none absolute inset-0" aria-hidden />

          {/* Декоративные звёзды */}
          {[
            { style: { top: "12%", left: "6%" }, r: -12, d: 0 },
            { style: { top: "66%", left: "10%" }, r: 8, d: 0.6 },
            { style: { top: "18%", right: "8%" }, r: 14, d: 0.3 },
            { style: { bottom: "16%", right: "12%" }, r: -6, d: 0.9 },
          ].map((p, i) => (
            <motion.svg
              key={i}
              viewBox="0 0 24 24"
              className="pointer-events-none absolute h-7 w-7 text-hl sm:h-9 sm:w-9"
              style={p.style}
              initial={{ opacity: 0, scale: 0, rotate: p.r }}
              whileInView={{ opacity: 1, scale: 1, rotate: p.r }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + p.d * 0.4, type: "spring", bounce: 0.6 }}
              aria-hidden
            >
              <path
                d="M12 2c.8 5.4 4.6 9.2 10 10-5.4.8-9.2 4.6-10 10-.8-5.4-4.6-9.2-10-10 5.4-.8 9.2-4.6 10-10z"
                fill="currentColor"
              />
            </motion.svg>
          ))}

          <div className="relative">
            <Reveal>
              <SectionTag dark rotate={1}>
                Для учеников и учителей
              </SectionTag>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="mx-auto mt-8 max-w-3xl font-display text-[clamp(1.9rem,5vw,3.8rem)] leading-[1.08] font-bold tracking-tight">
                Попробуй первый квиз.
                <br />
                Это займёт <span className="text-hl">3 минуты.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="mt-10 flex justify-center">
                <button
                  onClick={onTryDemo}
                  className="pressable group inline-flex items-center gap-3 rounded-2xl bg-paper px-8 py-4.5 text-base font-extrabold text-ink shadow-[0_24px_48px_-16px_rgba(250,247,240,0.4)] transition-all hover:-translate-y-0.5 hover:bg-hl"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Начать бесплатно
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <p className="mt-6 text-sm font-semibold text-paper/45">
                Первое задание занимает не больше трёх минут
              </p>
            </Reveal>

            <Squiggle
              className="mx-auto mt-2 h-[12px] w-64 opacity-70"
              color="#ff8a3d"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
