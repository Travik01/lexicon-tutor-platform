import { ArrowUpRight, Mail, Send } from "lucide-react";
import { Logo } from "./Header";

const COLS = [
  {
    title: "Ученикам",
    links: ["Подготовка к ЕГЭ", "Олимпиады", "Карточки", "Рейтинг класса"],
    href: "#directions",
  },
  {
    title: "Учителям",
    links: ["Создать задание", "Кабинет учителя", "Примеры уроков", "Тарифы для школ"],
    href: "#teachers",
  },
  {
    title: "Компания",
    links: ["О проекте", "Поддержка", "Политика конфиденциальности"],
    href: "#top",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="flex flex-col justify-between gap-12 lg:flex-row">
          <div className="max-w-sm">
            <Logo dark />
            <p className="mt-5 text-[15px] leading-relaxed font-medium text-paper/55">
              Английский, который не бесит: квизы, игры, карточки и понятные задачи — для ЕГЭ,
              олимпиад и жизни.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <a
                href="https://t.me/chistovik_app"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable grid h-10 w-10 place-items-center rounded-full border border-paper/20 transition-colors hover:border-hl hover:text-hl"
                aria-label="Мы в Telegram"
                title="Мы в Telegram"
              >
                <Send className="h-4.5 w-4.5" />
              </a>
              <a
                href="mailto:privet@chistovik.app"
                className="pressable grid h-10 w-10 place-items-center rounded-full border border-paper/20 transition-colors hover:border-hl hover:text-hl"
                aria-label="Написать на почту"
                title="Написать на почту"
              >
                <Mail className="h-4.5 w-4.5" />
              </a>
            </div>
            <a
              href="#top"
              className="pressable group mt-7 inline-flex items-center gap-2 rounded-full border border-paper/20 px-5 py-2.5 text-sm font-bold transition-colors hover:border-hl hover:text-hl"
            >
              Наверх
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <nav className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {COLS.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-extrabold tracking-[0.2em] text-paper/40 uppercase">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href={col.href}
                        className="text-sm font-semibold text-paper/70 transition-colors hover:text-paper"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-7 sm:flex-row">
          <p className="text-xs font-semibold text-paper/40">
            © 2026 Чистовик. Все права защищены.
          </p>
          <p className="text-xs font-semibold text-paper/40">
            Образовательная платформа для олимпиадников
          </p>
        </div>
      </div>
    </footer>
  );
}
