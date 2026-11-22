import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell as BellIcon, CheckCheck, Inbox } from "lucide-react";
import type { LessonAttempt } from "../../data/progress";

export default function Bell({ attempts = [] }: { attempts?: LessonAttempt[] }) {
  const [open, setOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);

  // Берём последние 6 реальных попыток как уведомления
  const notes = attempts.slice(0, 6).map((a, i) => ({
    id: a.id,
    text: `${a.title} — ${a.score}/${a.total}`,
    time: new Date(a.completedAt).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    }),
    unread: i < attempts.length - readCount && i < 3,
  }));

  const unread = notes.filter((n) => n.unread).length;
  const readAll = () => setReadCount(attempts.length);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="pressable relative grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink/60 transition-colors hover:border-ink/30 hover:text-ink"
        aria-label={unread > 0 ? `Уведомления, ${unread} новых` : "Уведомления"}
        aria-expanded={open}
      >
        <BellIcon className="h-4.5 w-4.5" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose px-1 text-[9px] font-extrabold text-white ring-2 ring-paper"
            >
              {unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Фон для закрытия */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70]"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            {/* Попап */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-3 top-16 z-[75] w-[min(340px,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-[20px] border border-line bg-white shadow-[0_24px_56px_-16px_rgba(27,23,18,0.45)] sm:absolute sm:right-0 sm:top-auto sm:mt-2.5 sm:fixed-auto"
              role="dialog"
              aria-label="Уведомления"
            >
              <div className="flex items-center justify-between border-b border-line/70 px-5 py-3.5">
                <p className="text-sm font-extrabold">Уведомления</p>
                {notes.length > 0 && (
                  <button
                    onClick={readAll}
                    disabled={unread === 0}
                    className={
                      "pressable inline-flex items-center gap-1.5 text-[11px] font-extrabold transition-colors " +
                      (unread === 0
                        ? "cursor-default text-ink/30"
                        : "text-accent-deep hover:text-accent")
                    }
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    {unread === 0 ? "Всё прочитано" : "Прочитать все"}
                  </button>
                )}
              </div>

              {notes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
                  <Inbox className="h-8 w-8 text-ink/15" />
                  <p className="text-sm font-bold text-ink/40">Уведомлений пока нет</p>
                  <p className="text-xs font-semibold text-ink/25">
                    Здесь появятся результаты занятий
                  </p>
                </div>
              ) : (
                <ul className="max-h-72 divide-y divide-line/50 overflow-y-auto">
                  {notes.map((n, i) => (
                    <motion.li
                      key={n.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 + i * 0.03, duration: 0.25 }}
                      className={
                        "flex items-center gap-3 px-5 py-3 " +
                        (n.unread ? "bg-accent/[.04]" : "")
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] leading-snug font-bold">
                          {n.text}
                        </p>
                        <p className="mt-0.5 text-[11px] font-semibold text-ink/35">
                          {n.time}
                        </p>
                      </div>
                      {n.unread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
