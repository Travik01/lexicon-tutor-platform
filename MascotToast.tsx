import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ezhi from "../../assets/mascot-ezhi.png";
import oli from "../../assets/mascot-oli.png";

export type MascotId = "ezhi" | "oli";

export const MASCOTS: Record<
  MascotId,
  { name: string; img: string; role: string; earns: string; ring: string }
> = {
  ezhi: {
    name: "Эжи",
    img: ezhi,
    role: "ЕГЭ и грамматика",
    earns: "баллы за задания",
    ring: "ring-accent/30",
  },
  oli: {
    name: "Оли",
    img: oli,
    role: "Олимпиады и лексика",
    earns: "баллы за карточки и игры",
    ring: "ring-tangerine/40",
  },
};

export type Toast = { mascot: MascotId; points: number; text: string };

/* Тост: маскот приходит похвастать начисленными баллами */
export default function MascotToast({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 4500);
    return () => window.clearTimeout(id);
  }, [onDone]);

  const m = MASCOTS[toast.mascot];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9, rotate: -3 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, y: 40, scale: 0.94 }}
      transition={{ type: "spring", bounce: 0.45, duration: 0.7 }}
      className="fixed right-4 bottom-4 z-[95] w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center gap-4 overflow-hidden rounded-[22px] border border-white/10 bg-ink p-4 pl-5 text-paper shadow-[0_40px_80px_-28px_rgba(27,23,18,0.7)]">
        <div className="grid-paper-dark pointer-events-none absolute inset-0" aria-hidden />
        <motion.img
          src={m.img}
          alt={`Маскот ${m.name}`}
          initial={{ rotate: -8, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.6, delay: 0.15 }}
          className={`relative h-16 w-16 shrink-0 rounded-2xl border border-line object-cover ring-4 ${m.ring}`}
        />
        <div className="relative min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-hl">
            <Sparkles className="h-3.5 w-3.5" />
            {m.name}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug font-semibold text-paper/80">
            {toast.text}
          </p>
        </div>
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.6, delay: 0.25 }}
          className="relative ml-auto grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-hl font-display text-[15px] font-bold text-ink"
        >
          +{toast.points}
        </motion.span>
      </div>
    </motion.div>
  );
}
