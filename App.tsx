import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Hero from "./components/Hero";
import StatsBand from "./components/StatsBand";
import Directions from "./components/Directions";
import Formats from "./components/Formats";
import Teachers from "./components/Teachers";
import Join from "./components/Join";
import FAQ from "./components/FAQ";
import CTABanner from "./components/CTABanner";
import Footer from "./components/Footer";
import Login from "./views/Login";
import AppArea from "./views/app/AppArea";
import { STUDENTS as INITIAL_STUDENTS, type Role, type Student } from "./data/mock";

const SESSION_KEY = "ch2-demo-session";
const AUTOPLAY_KEY = "ch2-autoplay-quiz";
const COUNTER_RESET_VERSION = "4";
const COUNTER_RESET_KEY = "ch2-counter-reset-version";

// Устаревшие ключи прошлых версий
const LEGACY_KEYS = [
  "chistovik-demo-session",
  "ch-quiz-result",
  "ch-deck-done",
  "ch-points",
  "ch-quiz-bump",
  "ch-assignments",
  "ch-prefs",
];

type View = "landing" | "login";

function readSession(): Role | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw === "admin" || raw === "student") return raw;
    return null;
  } catch {
    return null;
  }
}

const screenTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export default function App() {
  const [role, setRole] = useState<Role | null>(() => readSession());
  const [view, setView] = useState<View>("landing");

  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));

      // Одноразово обнуляем учебные счётчики, но не трогаем сами задания.
      if (localStorage.getItem(COUNTER_RESET_KEY) !== COUNTER_RESET_VERSION) {
        ["ch2-lesson-results", "ch2-lesson-attempts", "ch2-points", "ch2-prefs"].forEach((k) =>
          localStorage.removeItem(k)
        );
        Object.keys(localStorage)
          .filter((key) => key.startsWith("ch2-lesson-draft:"))
          .forEach((key) => localStorage.removeItem(key));

        const storedStudents = (() => {
          try {
            return JSON.parse(localStorage.getItem("ch2-students") ?? "null") as Student[] | null;
          } catch {
            return null;
          }
        })();
        const zeroedStudents = (storedStudents ?? INITIAL_STUDENTS).map((s) => ({
          ...s,
          progress: 0,
          streak: 0,
          words: 0,
        }));
        localStorage.setItem("ch2-students", JSON.stringify(zeroedStudents));
        localStorage.setItem(COUNTER_RESET_KEY, COUNTER_RESET_VERSION);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    document.title =
      role != null
        ? role === "admin"
          ? "Кабинет преподавателя — Чистовик"
          : "Практика — Чистовик"
        : view === "login"
          ? "Вход — Чистовик"
          : "Чистовик — английский для ЕГЭ и жизни";
  }, [view, role]);

  const login = (r: Role) => {
    try {
      localStorage.setItem(SESSION_KEY, r);
    } catch {
      /* ignore */
    }
    setRole(r);
  };

  // Код задания → занятие сразу открывается, без регистрации
  const startByCode = (lessonId: string) => {
    try {
      localStorage.setItem(AUTOPLAY_KEY, lessonId);
    } catch {
      /* ignore */
    }
    login("student");
  };

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setRole(null);
    setView("landing");
  };

  const screen = role ? (
    <motion.div key={`app-${role}`} {...screenTransition}>
      <AppArea role={role} onLogout={logout} />
    </motion.div>
  ) : view === "login" ? (
    <motion.div key="login" {...screenTransition}>
      <Login onLogin={login} onBack={() => setView("landing")} />
    </motion.div>
  ) : (
    <motion.div key="landing" {...screenTransition}>
      <div className="min-h-screen">
        <Header onLogin={() => setView("login")} />
        <main>
          <Hero />
          <StatsBand />
          <Directions />
          <Formats />
          <Teachers onLogin={() => setView("login")} />
          <Join onLogin={() => setView("login")} onStart={startByCode} />
          <FAQ />
          <CTABanner onTryDemo={() => login("student")} />
        </main>
        <Footer />
      </div>
    </motion.div>
  );

  return <AnimatePresence mode="wait">{screen}</AnimatePresence>;
}
