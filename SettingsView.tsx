import { useState } from "react";
import { CircleAlert, Info, RotateCcw, ShieldCheck } from "lucide-react";
import { ADMIN } from "../../data/mock";
import { Panel, SectionTitle, Toggle } from "./shared";

const PREFS = [
  { key: "letters", title: "Письма о прогрессе учеников", text: "раз в неделю — кто вырос, кто просел", def: true },
  { key: "report", title: "Еженедельный отчёт по классам", text: "активность, выполнение и слабые темы", def: true },
  { key: "materials", title: "Новые материалы по английскому", text: "свежие подборки слов и заданий в библиотеке", def: false },
];

const PREFS_KEY = "ch2-prefs";

export default function SettingsView({
  teacherName = "",
  onNameChange,
}: {
  teacherName?: string;
  onNameChange?: (name: string) => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [nameValue, setNameValue] = useState(teacherName);
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const defaults = Object.fromEntries(PREFS.map((p) => [p.key, p.def]));
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
      return defaults;
    }
  });

  const setPref = (key: string, v: boolean) =>
    setToggles((t) => {
      const next = { ...t, [key]: v };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

  return (
    <div className="space-y-6">
      <SectionTitle title="Настройки" hint="профиль и уведомления кабинета" />

      <div className="grid items-start gap-5 lg:grid-cols-2">
         <Panel className="p-6 sm:p-7">
          <h2 className="font-display text-lg font-semibold">Профиль</h2>
          <div className="mt-5 flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent font-display text-lg font-bold text-white">
              {nameValue ? nameValue.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "П"}
            </span>
            <div>
              <p className="text-lg font-extrabold">{nameValue || "Преподаватель"}</p>
              <p className="text-sm font-bold text-ink/45">{ADMIN.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="settings-name"
                className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase"
              >
                Ваше имя
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="settings-name"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Введите имя"
                  autoComplete="name"
                  className="flex-1 rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-3 text-[15px] font-bold outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
                />
                <button
                  onClick={() => onNameChange?.(nameValue)}
                  className="pressable shrink-0 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-deep"
                >
                  Сохранить
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                Роль
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-line bg-paper-2/50 px-4.5 py-3">
                <ShieldCheck className="h-4.5 w-4.5 text-accent" />
                <span className="text-[15px] font-extrabold">Преподаватель</span>
                <span className="ml-auto rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-accent-deep uppercase">
                  рабочий кабинет
                </span>
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold">Уведомления</h2>
            <ul className="mt-4 divide-y divide-line/70">
              {PREFS.map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-4 py-4 first:pt-1 last:pb-0">
                  <div>
                    <p className="text-[15px] font-extrabold">{p.title}</p>
                    <p className="mt-0.5 text-[13px] font-semibold text-ink/45">{p.text}</p>
                  </div>
                  <Toggle on={toggles[p.key]} onChange={(v) => setPref(p.key, v)} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="flex items-start gap-3.5 border-dashed bg-paper-2/50 p-5">
            <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent" />
            <p className="text-[13px] leading-relaxed font-semibold text-ink-soft">
              Данные об учениках и заданиях хранятся на этом устройстве.
              В полной версии они синхронизируются с сервером.
            </p>
          </Panel>

          {/* Опасная зона: сброс демо-данных */}
          <Panel className="border-rose/40 bg-rose/[.04] p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                  <CircleAlert className="h-5 w-5 text-rose" />
                  Опасная зона
                </h2>
                <p className="mt-1 max-w-sm text-[13px] font-semibold text-ink-soft">
                  Сбросить данные аккаунта: задания, прогресс занятий, баллы маскотов и настройки.
                  Все результаты будут удалены.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!confirmReset) {
                    setConfirmReset(true);
                    setTimeout(() => setConfirmReset(false), 4000);
                    return;
                  }
                  try {
                    // Не трогаем данные других приложений на том же домене.
                    Object.keys(localStorage)
                      .filter(
                        (key) =>
                          key.startsWith("ch2-") ||
                          key.startsWith("ch-") ||
                          key === "chistovik-demo-session"
                      )
                      .forEach((key) => localStorage.removeItem(key));
                  } catch {
                    /* ignore */
                  }
                  window.location.reload();
                }}
                className={
                  "pressable inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold transition-colors " +
                  (confirmReset
                    ? "bg-rose text-white shadow-[0_14px_28px_-14px_rgba(242,84,125,0.7)]"
                    : "border-2 border-rose/40 text-rose hover:bg-rose/10")
                }
              >
                <RotateCcw className="h-4 w-4" />
                {confirmReset ? "Подтвердить сброс?" : "Сбросить данные"}
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
