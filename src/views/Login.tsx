import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import { Logo } from "../components/Header";
import { Squiggle } from "../components/Reveal";
import { ADMIN, type Role } from "../data/mock";
import { PROFILE_KEY, type GuestProfile } from "./app/GuestOnboarding";

const TEACHER_AUTH_KEY = "ch2-teacher-auth";
const STUDENT_AUTH_KEY = "ch2-student-auth";
const TEACHER_NAME_KEY = "ch2-teacher-name";

type PersonTab = "teacher" | "student";
type AuthMode = "login" | "register";

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export default function Login({
  onLogin,
  onBack,
}: {
  onLogin: (role: Role) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<PersonTab>("teacher");
  const [mode, setMode] = useState<AuthMode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [caps, setCaps] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shake, setShake] = useState(0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const em = email.trim().toLowerCase();
    const pass = password.trim();

    if (!em || !pass || (mode === "register" && !name.trim())) {
      setError("Заполните все обязательные поля.");
      setShake((s) => s + 1);
      return;
    }

    if (tab === "teacher") {
      const storedTeacher = readLocal<{ name: string; email: string; password: string } | null>(
        TEACHER_AUTH_KEY,
        null
      );

      if (mode === "register") {
        writeLocal(TEACHER_AUTH_KEY, {
          name: name.trim(),
          email: em,
          password: pass,
        });
        writeLocal(TEACHER_NAME_KEY, name.trim());
        setSuccess("Аккаунт учителя создан. Теперь можно войти.");
        setMode("login");
        setPassword("");
        return;
      }

      const validStoredTeacher =
        storedTeacher && storedTeacher.email === em && storedTeacher.password === pass;
      const validDefaultTeacher = em === ADMIN.email && pass === ADMIN.password;

      if (validStoredTeacher || validDefaultTeacher) {
        return onLogin("admin");
      }

      setError("Неверная почта или пароль.");
      setShake((s) => s + 1);
      return;
    }

    // student
    const storedStudent = readLocal<
      { name: string; email: string; password: string; profile?: GuestProfile } | null
    >(STUDENT_AUTH_KEY, null);

    if (mode === "register") {
      const studentProfile: GuestProfile = {
        name: name.trim(),
        goal: "general",
        level: "unknown",
      };
      writeLocal(STUDENT_AUTH_KEY, {
        name: name.trim(),
        email: em,
        password: pass,
        profile: studentProfile,
      });
      writeLocal(PROFILE_KEY, studentProfile);
      return onLogin("student");
    }

    if (storedStudent && storedStudent.email === em && storedStudent.password === pass) {
      if (storedStudent.profile) writeLocal(PROFILE_KEY, storedStudent.profile);
      return onLogin("student");
    }

    setError("Неверная почта или пароль.");
    setShake((s) => s + 1);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Левая панель */}
      <div className="relative hidden overflow-hidden bg-ink text-paper lg:flex lg:flex-col">
        <div className="grid-paper-dark absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/30 blur-[110px]" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-hl/20 blur-[120px]" aria-hidden />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center justify-between">
            <Logo dark />
            <button
              onClick={onBack}
              className="pressable inline-flex items-center gap-2 rounded-full border border-paper/20 px-4 py-2 text-sm font-bold transition-colors hover:border-hl hover:text-hl"
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-hl/80">
              {tab === "teacher" ? "Кабинет преподавателя" : "Кабинет ученика"}
            </p>
            <h2 className="mt-4 font-display text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.12] font-bold tracking-tight">
              {tab === "teacher" ? "Управляйте курсом, учениками и материалами" : "Продолжай учиться с того места, где остановился"}
            </h2>
            <Squiggle className="mt-5 h-[12px] w-64" color="#ff8a3d" />
            <p className="mt-6 max-w-md text-[15px] leading-relaxed font-medium text-paper/60">
              {tab === "teacher"
                ? "Создавайте задания, добавляйте словарные наборы и отслеживайте результаты учеников."
                : "Выполняйте задания, повторяйте слова урока и возвращайтесь к незавершённым занятиям в удобное время."}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-paper/50 leading-relaxed">
              {tab === "teacher"
                ? "Если у вас ещё нет аккаунта, зарегистрируйтесь за минуту."
                : "Можно заниматься свободно или сохранить результаты в аккаунте."}
            </p>
          </div>
        </div>
      </div>

      {/* Правая часть */}
      <div className="grid-paper relative flex items-center justify-center px-5 py-10 sm:px-10">
        <button
          onClick={onBack}
          className="pressable absolute top-6 left-6 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-bold backdrop-blur transition-colors hover:border-ink/30 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[0_40px_80px_-36px_rgba(27,23,18,0.4)] sm:p-9">
            {/* Tabs */}
            <div className="flex rounded-2xl bg-paper-2/60 p-1">
              {[
                { id: "teacher", label: "Учитель", icon: KeyRound },
                { id: "student", label: "Ученик", icon: UserRound },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id as PersonTab);
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  className={
                    "pressable flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold transition-colors " +
                    (tab === t.id ? "bg-white text-ink shadow-sm" : "text-ink/45")
                  }
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Mode toggle */}
            <div className="mt-4 flex gap-2">
              {[
                { id: "login", label: "Вход" },
                { id: "register", label: "Регистрация" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as AuthMode);
                    setError("");
                    setSuccess("");
                  }}
                  className={
                    "pressable rounded-full px-4 py-2 text-xs font-extrabold transition-colors " +
                    (mode === m.id ? "bg-ink text-paper" : "bg-paper-2/70 text-ink/45")
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-hl">
                {tab === "teacher" ? <KeyRound className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
              </span>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">
                  {tab === "teacher"
                    ? mode === "login"
                      ? "Вход преподавателя"
                      : "Регистрация преподавателя"
                    : mode === "login"
                      ? "Вход ученика"
                      : "Регистрация ученика"}
                </h1>
                <p className="text-xs font-bold text-ink-soft/70">
                  {tab === "teacher"
                    ? "Управление курсом, учениками и заданиями"
                    : "Сохранение результатов и доступ к своему прогрессу"}
                </p>
              </div>
            </div>

            <motion.form
              key={`${tab}-${mode}-${shake}`}
              animate={shake ? { x: [0, -9, 9, -6, 6, 0] } : {}}
              transition={{ duration: 0.45 }}
              onSubmit={submit}
              className="mt-7 space-y-4"
              noValidate
            >
              {mode === "register" && (
                <div>
                  <label className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                    Имя
                  </label>
                  <div className="relative mt-2">
                    <UserRound className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-ink/35" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={tab === "teacher" ? "Ирина Смирнова" : "Александр"}
                      autoComplete="name"
                      className="w-full rounded-2xl border-2 border-line bg-paper/60 py-3.5 pr-4 pl-11 text-[15px] font-bold outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                  Почта
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-ink/35" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder={tab === "teacher" ? "teacher@example.com" : "student@example.com"}
                    autoComplete="username"
                    className="w-full rounded-2xl border-2 border-line bg-paper/60 py-3.5 pr-4 pl-11 text-[15px] font-bold outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                  Пароль
                </label>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-ink/35" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
                    onKeyDown={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    className={
                      "w-full rounded-2xl border-2 bg-paper/60 py-3.5 pr-12 pl-11 text-[15px] font-bold transition-all outline-none focus:bg-white " +
                      (error
                        ? "border-rose focus:ring-4 focus:ring-rose/15"
                        : "border-line focus:border-accent focus:ring-4 focus:ring-accent/15")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="pressable absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
                    aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                <AnimatePresence>
                  {caps && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-extrabold text-tangerine"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Включён Caps Lock — пароль чувствителен к регистру
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 text-sm font-bold text-rose"
                  >
                    <CircleAlert className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p
                    key="ok"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-bold text-[#13683f]"
                  >
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="pressable w-full rounded-2xl bg-ink py-4 font-display text-sm font-bold text-paper shadow-[0_18px_36px_-14px_rgba(27,23,18,0.55)] transition-all hover:bg-accent"
              >
                {mode === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            </motion.form>

            {tab === "student" && mode === "login" && (
              <button
                onClick={() => onLogin("student")}
                className="pressable mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-ink/10 px-4 py-3 text-sm font-bold text-ink-soft transition-colors hover:border-ink/30 hover:bg-paper/60"
              >
                <UserRound className="h-4.5 w-4.5 text-accent" />
                Начать без регистрации
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
