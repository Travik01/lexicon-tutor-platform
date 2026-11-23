import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(6px)" },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span";
}) {
  const Comp = as === "span" ? motion.span : motion.div;
  return (
    <Comp
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      custom={delay}
    >
      {children}
    </Comp>
  );
}

/* Жирная «рукописная» волнистая линия, дорисовывающаяся при скролле */
export function Squiggle({
  className,
  color = "#6c4df6",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 14"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d="M3 10 C 30 3, 55 3, 82 8 S 135 13, 162 7 S 204 3, 217 6"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

/* Стикер-подпись раздела */
export function SectionTag({
  children,
  rotate = -1.5,
  dark = false,
}: {
  children: ReactNode;
  rotate?: number;
  dark?: boolean;
}) {
  return (
    <span
      style={{ transform: `rotate(${rotate}deg)` }}
      className={
        "inline-block rounded-lg border border-dashed px-3.5 py-1.5 font-sans text-[11px] font-bold uppercase tracking-[0.18em] " +
        (dark
          ? "border-paper/30 bg-paper/5 text-paper/80"
          : "border-ink/25 bg-white/70 text-ink/70 shadow-[2px_3px_0_rgba(27,23,18,0.08)]")
      }
    >
      {children}
    </span>
  );
}
