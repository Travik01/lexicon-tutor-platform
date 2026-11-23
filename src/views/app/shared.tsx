import { useState, type ReactNode } from "react";
import {
  BookOpen,
  Check,
  Copy,
  Headphones,
  Layers,
  ListChecks,
  MessageCircle,
  PenLine,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Assignment } from "../../data/mock";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const hasDarkBg = className.includes("bg-ink");
  return (
    <div className={`rounded-[24px] border ${hasDarkBg ? "border-white/10" : "border-line bg-white"} ${className}`}>{children}</div>
  );
}

const FORMAT_ICONS: Record<Assignment["format"], LucideIcon> = {
  Квиз: Zap,
  Карточки: Layers,
  Блиц: ListChecks,
  Задачи: PenLine,
  Чтение: BookOpen,
  Письмо: PenLine,
  Говорение: MessageCircle,
  Аудирование: Headphones,
};

const FORMAT_COLORS: Record<Assignment["format"], string> = {
  Квиз: "bg-hl text-ink",
  Карточки: "bg-accent text-white",
  Блиц: "bg-tangerine text-white",
  Задачи: "bg-sky text-white",
  Чтение: "bg-mint text-white",
  Письмо: "bg-rose text-white",
  Говорение: "bg-tangerine text-white",
  Аудирование: "bg-sky text-white",
};

export function FormatBadge({ format }: { format: Assignment["format"] }) {
  const Icon = FORMAT_ICONS[format];
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${FORMAT_COLORS[format]}`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

export function CodeChip({ code, dark = false }: { code: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(code).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={
        "pressable inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs font-extrabold tracking-[0.08em] transition-colors " +
        (dark
          ? "border-hl/30 bg-hl/10 text-hl hover:bg-hl/20"
          : "border-line bg-paper text-ink hover:border-ink/30")
      }
      title={copied ? "Скопировано" : "Нажми, чтобы скопировать код"}
    >
      {code}
      {copied ? <Check className="h-3.5 w-3.5 text-mint" /> : <Copy className="h-3.5 w-3.5 opacity-50" />}
    </button>
  );
}

const LEVEL_CLS: Record<string, string> = {
  A1: "bg-mint/12 text-[#13683f] border-mint/25",
  A2: "bg-sky/12 text-[#2b5cb8] border-sky/25",
  B1: "bg-accent/10 text-accent-deep border-accent/25",
  B2: "bg-tangerine/12 text-[#b3541a] border-tangerine/30",
  C1: "bg-rose/12 text-rose border-rose/25",
};

export function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 font-display text-[11px] font-bold ${LEVEL_CLS[level] ?? LEVEL_CLS.B1}`}
    >
      {level}
    </span>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-bold tracking-tight">
          {title}
        </h1>
        {hint && <p className="mt-1.5 text-sm font-semibold text-ink-soft/80">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

/* Переключатель-тумблер для настроек */
export function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
        on ? "bg-mint" : "bg-ink/15"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
          on ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
