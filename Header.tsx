import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { href: "#directions", label: "Направления" },
  { href: "#formats", label: "Форматы" },
  { href: "#teachers", label: "Учителям" },
  { href: "#faq", label: "Вопросы" },
  { href: "#join", label: "У меня есть код" },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink shadow-[3px_4px_0_rgba(255,217,82,0.9)] transition-transform duration-300 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M5.5 12.5l4.5 4.5 8.5-9.5"
            stroke="#FAF7F0"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={
          "font-display text-[17px] font-semibold tracking-tight " +
          (dark ? "text-paper" : "text-ink")
        }
      >
        Чистовик
      </span>
    </a>
  );
}

export default function Header({ onLogin }: { onLogin?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc закрывает мобильное меню
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 " +
        (scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent")
      }
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <button
            onClick={onLogin}
            className="pressable rounded-full px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-ink/5"
          >
            Войти
          </button>
          <a
            href="#cta"
            className="pressable group inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper shadow-[0_12px_30px_-12px_rgba(27,23,18,0.6)] transition-all hover:shadow-[0_16px_34px_-12px_rgba(108,77,246,0.65)] hover:bg-accent"
          >
            Начать учиться
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="pressable grid h-10 w-10 place-items-center rounded-full border border-line bg-white/80 lg:hidden"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-line bg-paper/95 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-semibold text-ink transition-colors hover:bg-ink/5"
                >
                  {l.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onLogin?.();
                }}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-ink/10 px-5 py-3.5 text-base font-bold text-ink"
              >
                Войти
              </button>
              <a
                href="#cta"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-ink px-5 py-3.5 text-base font-bold text-paper"
              >
                Начать учиться
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Полоса прогресса чтения страницы */}
      <motion.div
        style={{ scaleX: progress }}
        className="absolute bottom-0 left-0 h-[2.5px] w-full origin-left bg-gradient-to-r from-accent via-tangerine to-hl"
        aria-hidden
      />
    </header>
  );
}
