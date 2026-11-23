/**
 * Чистовик — backend API
 * Node + Express, данные в JSON-файле, загрузка mp3/обложек в /media.
 *
 * Запуск:  node server/index.mjs        (API + статика из dist, если собран)
 *          PORT=8787 node server/index.mjs
 */
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SECRET_FILE = path.join(DATA_DIR, "secret.txt");
const DIST = path.join(ROOT, "dist");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Ключ подписи токенов живёт отдельно от db.json.
 * Иначе любая пересборка базы обнуляла бы все входы и сайт писал
 * «Нужен вход в аккаунт» уже залогиненному учителю.
 */
function readOrCreateSecret() {
  try {
    const saved = fs.readFileSync(SECRET_FILE, "utf8").trim();
    if (saved.length >= 32) return saved;
  } catch {
    /* создадим ниже */
  }
  const fresh = crypto.randomBytes(32).toString("hex");
  try {
    fs.writeFileSync(SECRET_FILE, fresh, { mode: 0o600 });
  } catch {
    /* ignore */
  }
  return fresh;
}

const SECRET = readOrCreateSecret();

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) =>
  `scrypt:${salt}:${crypto.scryptSync(String(password), salt, 32).toString("hex")}`;

const checkPassword = (password, stored) => {
  if (!stored) return false;
  if (!String(stored).startsWith("scrypt:")) return String(password) === String(stored);
  const [, salt] = String(stored).split(":");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hashPassword(password, salt).split(":")[2], "hex"),
      Buffer.from(String(stored).split(":")[2], "hex")
    );
  } catch {
    return false;
  }
};

/* ─────────────────────────  Хранилище  ───────────────────────── */

const DEFAULT_TEACHER = {
  name: "Преподаватель",
  email: "admin@chistovik.app",
  // пароль по умолчанию: english2026
  password: process.env.TEACHER_PASSWORD || "english2026",
  bio: "Английский для ЕГЭ, олимпиад и жизни",
};

function emptyDb() {
  return {
    secret: SECRET,
    teacher: { ...DEFAULT_TEACHER },
    students: [],
    tasks: [],
    tests: [],
    sets: [],
    submissions: [],
    lessonComments: {}, // id встроенного задания → общий комментарий учителя
    program: [], // программа курса, собранная учителем
    createdAt: new Date().toISOString(),
  };
}

let writeTimer = null;
let db = loadDb();

function loadDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return { ...emptyDb(), ...parsed, secret: SECRET };
  } catch {
    const fresh = emptyDb();
    saveDb(fresh);
    return fresh;
  }
}

function saveDb(next = db) {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(next, null, 2));
      fs.renameSync(tmp, DB_FILE);
    } catch (error) {
      console.error("Не удалось сохранить базу:", error);
    }
  }, 40);
}

const uid = (prefix = "id") => `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
const now = () => new Date().toISOString();

/* ─────────────────────────  Демо-контент  ───────────────────────── */
function seedDemo() {
  const t1 = {
    id: uid("task"),
    type: "choice",
    title: "Present Perfect — выбор формы",
    prompt: "Choose the correct form: She ___ English every day.",
    passage: "",
    audioUrl: "",
    options: [
      { id: uid("o"), text: "study", correct: false, comment: "С she нужно окончание -s." },
      { id: uid("o"), text: "studies", correct: true, comment: "Верно: в Present Simple с he/she/it добавляем -s." },
      { id: uid("o"), text: "is study", correct: false, comment: "Это смесь двух времён, так не говорят." },
    ],
    answers: [],
    explanation: "Present Simple: после she/he/it глагол получает -s — she studies.",
    points: 1,
    tags: [],
    createdAt: now(),
  };
  const t2 = {
    id: uid("task"),
    type: "gap",
    title: "Пропуск: since / for",
    prompt: "We have lived here ___ five years.",
    passage: "",
    audioUrl: "",
    options: [],
    answers: ["for"],
    explanation: "For — для промежутка времени (five years), since — для точки отсчёта (2020).",
    points: 2,
    tags: [],
    createdAt: now(),
  };
  const t3 = {
    id: uid("task"),
    type: "cards",
    title: "Лексика: achievements",
    prompt: "achievement",
    passage: "",
    audioUrl: "",
    options: [],
    answers: ["достижение"],
    explanation: "Winning the competition was a great achievement.",
    points: 1,
    tags: [],
    createdAt: now(),
  };

  db.tasks = [t1, t2, t3];
  db.tests = [
    {
      id: uid("test"),
      title: "Present Perfect — тренировка",
      description:
        "Три задания подряд: выбор формы, пропуск и карточка. После каждого ответа — объяснение.",
      topic: "Грамматика",
      level: "B1",
      code: "TASK-101",
      deadline: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
      status: "active",
      taskIds: [t1.id, t2.id, t3.id],
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  db.sets = [
    {
      id: uid("set"),
      title: "Unit 5 — Travelling",
      level: "B1",
      description: "Слова из урока 5: поездки, транспорт, аэропорт.",
      words: [
        { id: uid("w"), word: "departure", translation: "отправление", definition: "the act of leaving a place", example: "The departure time is 8:30.", category: "Places", partOfSpeech: "noun" },
        { id: uid("w"), word: "luggage", translation: "багаж", definition: "bags and suitcases for travelling", example: "Don't forget your luggage.", category: "Actions", partOfSpeech: "noun" },
        { id: uid("w"), word: "to board", translation: "садиться (в транспорт)", definition: "to get on a plane, train or ship", example: "We boarded the train at platform 5.", category: "Actions", partOfSpeech: "verb" },
        { id: uid("w"), word: "delay", translation: "задержка", definition: "when something happens later than planned", example: "There was a two-hour delay.", category: "Rules", partOfSpeech: "noun" },
        { id: uid("w"), word: "to set off", translation: "отправиться в путь", definition: "to start a journey", example: "We set off early in the morning.", category: "Actions", partOfSpeech: "phrasal verb" },
        { id: uid("w"), word: "comfortable", translation: "удобный", definition: "providing physical ease", example: "The seats were very comfortable.", category: "People / reactions", partOfSpeech: "adjective" },
      ],
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  saveDb();
}


/**
 * Программа курса по умолчанию.
 * Раньше она жила только в браузере учителя: ученики на других устройствах
 * видели свою копию, а правки никуда не попадали. Теперь программа лежит
 * на сервере и одинакова у всех.
 */
const PROGRAM_MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const MODULE_POOL = [
  ["Grammar Foundations", ["present-perfect", "articles", "used-to"]],
  ["Vocabulary & Reading", ["technology-vocab", "reading-green-city", "irregular-verbs"]],
  ["Exam Preparation", ["ege-grammar", "word-formation", "email-writing"]],
  ["Speaking & Listening", ["speaking-interview", "listening-dialogue", "reported-speech"]],
  ["Advanced Grammar", ["conditionals", "future-forms", "passive-voice"]],
  ["Olympiad Challenge", ["olympiad-idioms", "olympiad-character", "reading-digital-habits"]],
  ["Collocations & Phrasal Verbs", ["collocations-make-do", "phrasal-get", "articles-deep"]],
  ["Real-World English", ["travel-vocab", "reading-neighbour", "modals-obligation"]],
  ["Reading Comprehension", ["reading-ai-school", "reading-green-city", "reading-digital-habits"]],
  ["ЕГЭ: письменная часть", ["email-writing", "word-formation", "ege-grammar"]],
  ["ЕГЭ: устная часть", ["speaking-interview", "listening-dialogue", "present-perfect"]],
  ["Final Review", ["conditionals", "reported-speech", "future-forms"]],
];

const VOCAB_POOL = ["set-daily-life", "set-travel", "set-opinions"];

function seedProgram() {
  db.program = PROGRAM_MONTHS.map((month, i) => ({
    id: `set-${i + 1}`,
    month,
    title: `Set ${i + 1}: ${MODULE_POOL[i % MODULE_POOL.length][0]}`,
    modules: [
      {
        id: `m-${i + 1}-1`,
        title: MODULE_POOL[(i * 2) % MODULE_POOL.length][0],
        lessons: MODULE_POOL[(i * 2) % MODULE_POOL.length][1],
        vocabSetId: VOCAB_POOL[i % VOCAB_POOL.length],
      },
      {
        id: `m-${i + 1}-2`,
        title: MODULE_POOL[(i * 2 + 1) % MODULE_POOL.length][0],
        lessons: MODULE_POOL[(i * 2 + 1) % MODULE_POOL.length][1],
        vocabSetId: VOCAB_POOL[(i + 1) % VOCAB_POOL.length],
      },
    ],
  }));
}

if (!db.tasks.length && !db.tests.length && !db.sets.length) {
  seedDemo();
}

if (!Array.isArray(db.program) || !db.program.length) {
  seedProgram();
  saveDb();
}

/* ─────────────────────────  Токены  ───────────────────────── */

const b64 = (value) => Buffer.from(value).toString("base64url");
const unb64 = (value) => Buffer.from(value, "base64url").toString("utf8");

function signToken(payload) {
  const body = b64(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(unb64(body));
  } catch {
    return null;
  }
}

function auth(role = null) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: "Нужен вход в аккаунт" });
    if (role && payload.role !== role) return res.status(403).json({ error: "Недостаточно прав" });
    req.user = payload;
    next();
  };
}

/* ─────────────────────────  Валидация  ───────────────────────── */

const TASK_TYPES = ["choice", "multi", "gap", "audio", "cards", "open", "trio"];

function cleanTask(input = {}) {
  const type = TASK_TYPES.includes(input.type) ? input.type : "choice";
  const options = Array.isArray(input.options)
    ? input.options
        .map((option, index) => ({
          id: option.id || `o-${index}-${crypto.randomBytes(2).toString("hex")}`,
          text: String(option.text ?? "").trim(),
          correct: Boolean(option.correct),
          comment: String(option.comment ?? "").trim(),
        }))
        .filter((option) => option.text.length > 0)
    : [];
  return {
    id: input.id || uid("task"),
    type,
    title: String(input.title ?? "").trim(),
    prompt: String(input.prompt ?? "").trim(),
    passage: String(input.passage ?? "").trim(),
    audioUrl: input.audioUrl ? String(input.audioUrl) : "",
    options,
    answers: Array.isArray(input.answers)
      ? input.answers.map((answer) => String(answer).trim()).filter(Boolean)
      : String(input.answers ?? "")
          .split("|")
          .map((answer) => answer.trim())
          .filter(Boolean),
    explanation: String(input.explanation ?? "").trim(),
    points: Math.max(1, Math.min(50, Number(input.points) || 1)),
    timeLimitSeconds: input.timeLimitSeconds > 0 ? Math.min(7200, Math.floor(Number(input.timeLimitSeconds))) : undefined,
    trioSentences: type === "trio"
      ? [0, 1, 2].map((index) => String(input.trioSentences?.[index] ?? "").trim())
      : undefined,
    tags: Array.isArray(input.tags) ? input.tags.map(String) : [],
    updatedAt: now(),
  };
}

function validateTask(task) {
  if (!task.prompt && !task.audioUrl && !task.title) return "Заполните текст задания";
  if ((task.type === "choice" || task.type === "multi" || task.type === "audio") && task.options.length < 2)
    return "Нужно минимум два варианта ответа";
  if (["choice", "multi", "audio"].includes(task.type) && !task.options.some((o) => o.correct))
    return "Отметьте правильный вариант";
  if (task.type === "gap" && task.answers.length === 0) return "Укажите правильный ответ для пропуска";
  if (task.type === "trio" && (task.trioSentences?.length !== 3 || task.trioSentences.some((sentence) => !sentence)))
    return "Заполните все три предложения";
  if (task.type === "trio" && task.trioSentences.some((sentence) => !sentence.includes("___")))
    return "В каждом предложении укажите место глагола символами ___";
  if (task.type === "trio" && task.answers.length === 0) return "Укажите общий глагол";
  return null;
}

/* ─────────────────────────  Приложение  ───────────────────────── */

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use("/media", express.static(UPLOAD_DIR, { maxAge: "7d" }));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const safe = file.originalname
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(-60);
      cb(null, `${Date.now()}-${crypto.randomBytes(3).toString("hex")}-${safe || "file"}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    // Часть браузеров присылает application/octet-stream — смотрим и на расширение.
    const mime = String(file.mimetype || "");
    const ext = path.extname(String(file.originalname || "")).toLowerCase();
    const byMime =
      /audio\/(mpeg|mp3|wav|ogg|mp4|webm|x-m4a|aac|mpga)/.test(mime) ||
      /image\/(png|jpe?g|webp|gif|svg\+xml|bmp)/.test(mime);
    const byExt = [".mp3", ".wav", ".ogg", ".oga", ".m4a", ".aac", ".mp4", ".webm", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp"].includes(ext);
    const ok = byMime || byExt;
    cb(ok ? null : new Error("Можно загружать только mp3/wav/ogg и картинки"), ok);
  },
});

const publicContent = () => ({
  tasks: db.tasks,
  tests: db.tests,
  sets: db.sets,
  lessonComments: db.lessonComments,
  program: db.program,
  teacher: { name: db.teacher.name, bio: db.teacher.bio },
  updatedAt: now(),
});

/* --- Служебное --- */
app.get("/api/health", (_req, res) => res.json({ ok: true, version: 2 }));

/* --- Вход --- */
app.post("/api/auth/login", (req, res) => {
  const { role = "student", name = "", password = "" } = req.body || {};

  if (role === "admin") {
    const validEnv = String(password) === String(db.teacher.password);
    const validOwn = db.teacher.passwordHash ? checkPassword(password, db.teacher.passwordHash) : false;
    if (!validEnv && !validOwn) {
      return res.status(401).json({ error: "Неверный пароль" });
    }
    return res.json({
      token: signToken({ role: "admin", name: db.teacher.name }),
      user: { role: "admin", name: db.teacher.name, email: db.teacher.email },
    });
  }

  const email = String(req.body.email ?? "").trim().toLowerCase();
  const studentPassword = String(password ?? "");
  if (email) {
    const student = db.students.find((item) => String(item.email ?? "").toLowerCase() === email);
    if (!student || !student.passwordHash || !checkPassword(studentPassword, student.passwordHash)) {
      return res.status(401).json({ error: "Неверная почта или пароль." });
    }
    return res.json({
      token: signToken({ role: "student", id: student.id, name: student.name }),
      user: { role: "student", id: student.id, name: student.name, email: student.email, level: student.level || "unknown", goal: student.goal || "general" },
    });
  }

  const cleanName = String(name).trim();
  if (cleanName.length < 2) return res.status(400).json({ error: "Введите имя" });
  let student = db.students.find((s) => s.name.toLowerCase() === cleanName.toLowerCase());
  if (student?.passwordHash) {
    return res.status(401).json({ error: "Это имя связано с аккаунтом. Войдите по почте и паролю." });
  }
  if (!student) {
    student = {
      id: uid("student"),
      name: cleanName,
      level: req.body.level || "B1",
      goal: req.body.goal || "school",
      createdAt: now(),
    };
    db.students.push(student);
    saveDb();
  }
  return res.json({
    token: signToken({ role: "student", id: student.id, name: student.name }),
    user: { role: "student", id: student.id, name: student.name },
  });
});

/* Аккаунт ученика синхронизируется на сервере; гостевой вход по имени остаётся отдельным. */
app.post("/api/auth/student", (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (name.length < 2) return res.status(400).json({ error: "Введите имя (не менее 2 символов)." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "Введите корректный адрес почты." });
  if (password.trim().length < 6)
    return res.status(400).json({ error: "Пароль должен содержать не менее 6 символов." });
  const namedStudent = db.students.find((item) => item.name.toLowerCase() === name.toLowerCase());
  const emailOwner = db.students.find((item) => String(item.email ?? "").toLowerCase() === email);
  if (emailOwner?.passwordHash)
    return res.status(409).json({ error: "Аккаунт с такой почтой уже есть. Войдите или используйте другую почту." });
  if (emailOwner && emailOwner !== namedStudent)
    return res.status(409).json({ error: "Эта почта уже указана у другого ученика. Используйте другую почту." });

  let student = namedStudent;
  if (student?.passwordHash)
    return res.status(409).json({ error: "Это имя уже связано с аккаунтом. Войдите по почте или выберите другое имя." });
  if (student?.email && !String(student.email).toLowerCase().endsWith("@students.local") && String(student.email).toLowerCase() !== email)
    return res.status(409).json({ error: "Это имя уже указано у другого ученика. Используйте другое имя или обратитесь к учителю." });

  if (!student) {
    student = { id: uid("student"), name, level: "unknown", goal: "general", createdAt: now() };
    db.students.push(student);
  }
  student.email = email;
  student.passwordHash = hashPassword(password);
  saveDb();
  return res.status(201).json({
    token: signToken({ role: "student", id: student.id, name: student.name }),
    user: { role: "student", id: student.id, name: student.name, email: student.email, level: student.level || "unknown", goal: student.goal || "general" },
  });
});

/* Свой пароль учителя: сохраняем на сервере, чтобы вход совпадал с сохранением */
app.post("/api/auth/teacher", (req, res) => {
  const { name, email, password, currentPassword } = req.body || {};
  const nextPassword = String(password ?? "");
  if (nextPassword.trim().length < 6)
    return res.status(400).json({ error: "Пароль короче 6 символов" });

  const alreadyHasOwn = Boolean(db.teacher.passwordHash);
  if (alreadyHasOwn) {
    const okEnv = String(currentPassword ?? "") === String(db.teacher.password);
    const okOwn = checkPassword(currentPassword, db.teacher.passwordHash);
    if (!okEnv && !okOwn)
      return res
        .status(403)
        .json({ error: "Пароль уже задан на сервере. Войдите с ним или смените его в Настройках кабинета." });
  }

  db.teacher.passwordHash = hashPassword(nextPassword);
  if (name && String(name).trim()) db.teacher.name = String(name).trim();
  if (email && String(email).trim()) db.teacher.email = String(email).trim();
  saveDb();
  res.json({ ok: true, user: { name: db.teacher.name, email: db.teacher.email } });
});

app.get("/api/auth/me", auth(), (req, res) => res.json({ user: req.user }));

/* --- Контент (видят все ученики) --- */
app.get("/api/content", (_req, res) => res.json(publicContent()));

/* --- Задания (библиотека) --- */
app.get("/api/tasks", (_req, res) => res.json(db.tasks));

app.post("/api/tasks", auth("admin"), (req, res) => {
  const task = cleanTask(req.body);
  const error = validateTask(task);
  if (error) return res.status(400).json({ error });
  db.tasks.unshift({ ...task, createdAt: now() });
  saveDb();
  res.status(201).json(task);
});

app.put("/api/tasks/:id", auth("admin"), (req, res) => {
  const index = db.tasks.findIndex((task) => task.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Задание не найдено" });
  const task = cleanTask({ ...db.tasks[index], ...req.body, id: req.params.id });
  const error = validateTask(task);
  if (error) return res.status(400).json({ error });
  db.tasks[index] = task;
  saveDb();
  res.json(task);
});

app.delete("/api/tasks/:id", auth("admin"), (req, res) => {
  db.tasks = db.tasks.filter((task) => task.id !== req.params.id);
  db.tests = db.tests.map((test) => ({
    ...test,
    taskIds: test.taskIds.filter((id) => id !== req.params.id),
  }));
  saveDb();
  res.json({ ok: true });
});

/* --- Тесты / варианты (объединение нескольких заданий) --- */
function cleanTest(input = {}) {
  const taskIds = Array.isArray(input.taskIds) ? input.taskIds.filter(Boolean) : [];
  return {
    id: input.id || uid("test"),
    title: String(input.title ?? "").trim(),
    description: String(input.description ?? "").trim(),
    topic: String(input.topic ?? "Английский").trim(),
    level: String(input.level ?? "B1"),
    code: String(input.code ?? "").trim().toUpperCase(),
    deadline: String(input.deadline ?? "").trim(),
    status: input.status === "done" ? "done" : "active",
    taskIds,
    timeLimitSeconds: input.timeLimitSeconds > 0 ? Math.min(86400, Math.floor(Number(input.timeLimitSeconds))) : undefined,
    updatedAt: now(),
  };
}

app.get("/api/tests", (_req, res) => res.json(db.tests));

/** Ученик вводит код с лендинга — по нему находим вариант без входа */
app.get("/api/tests/code/:code", (req, res) => {
  const code = String(req.params.code || "").trim().toUpperCase();
  const test = db.tests.find((item) => item.code.toUpperCase() === code);
  if (!test) return res.status(404).json({ error: "Код не найден" });
  const tasks = test.taskIds.map((id) => db.tasks.find((task) => task.id === id)).filter(Boolean);
  res.json({ test, tasks });
});

app.post("/api/tests", auth("admin"), (req, res) => {
  const test = cleanTest(req.body);
  if (!test.title) return res.status(400).json({ error: "Введите название" });
  if (!test.taskIds.length) return res.status(400).json({ error: "Добавьте хотя бы одно задание" });
  if (!test.code) test.code = `TASK-${Math.floor(100 + Math.random() * 900)}`;
  db.tests.unshift({ ...test, createdAt: now() });
  saveDb();
  res.status(201).json(test);
});

app.put("/api/tests/:id", auth("admin"), (req, res) => {
  const index = db.tests.findIndex((test) => test.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Тест не найден" });
  const test = cleanTest({ ...db.tests[index], ...req.body, id: req.params.id });
  if (!test.title) return res.status(400).json({ error: "Введите название" });
  if (!test.taskIds.length) return res.status(400).json({ error: "Добавьте хотя бы одно задание" });
  db.tests[index] = test;
  saveDb();
  res.json(test);
});

app.patch("/api/tests/:id/status", auth("admin"), (req, res) => {
  const test = db.tests.find((item) => item.id === req.params.id);
  if (!test) return res.status(404).json({ error: "Тест не найден" });
  test.status = req.body?.status === "done" ? "done" : "active";
  test.updatedAt = now();
  saveDb();
  res.json(test);
});

app.delete("/api/tests/:id", auth("admin"), (req, res) => {
  db.tests = db.tests.filter((test) => test.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

/* --- Наборы слов (видят все ученики) --- */
function cleanSet(input = {}) {
  return {
    id: input.id || uid("set"),
    title: String(input.title ?? "").trim(),
    level: String(input.level ?? "B1"),
    description: String(input.description ?? "").trim(),
    words: Array.isArray(input.words)
      ? input.words
          .map((word, index) => ({
            id: word.id || `w-${index}-${crypto.randomBytes(2).toString("hex")}`,
            word: String(word.word ?? "").trim(),
            translation: String(word.translation ?? "").trim(),
            definition: String(word.definition ?? "").trim(),
            example: String(word.example ?? "").trim(),
            category: String(word.category ?? "Useful phrases").trim(),
            partOfSpeech: String(word.partOfSpeech ?? "noun").trim(),
          }))
          .filter((word) => word.word && word.translation)
      : [],
    updatedAt: now(),
  };
}

app.get("/api/sets", (_req, res) => res.json(db.sets));

app.post("/api/sets", auth("admin"), (req, res) => {
  const set = cleanSet(req.body);
  if (!set.title) return res.status(400).json({ error: "Введите название набора" });
  if (!set.words.length) return res.status(400).json({ error: "Добавьте хотя бы одно слово" });
  db.sets.unshift({ ...set, createdAt: now() });
  saveDb();
  res.status(201).json(set);
});

app.put("/api/sets/:id", auth("admin"), (req, res) => {
  const index = db.sets.findIndex((set) => set.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Набор не найден" });
  const set = cleanSet({ ...db.sets[index], ...req.body, id: req.params.id });
  if (!set.title) return res.status(400).json({ error: "Введите название набора" });
  db.sets[index] = set;
  saveDb();
  res.json(set);
});

app.delete("/api/sets/:id", auth("admin"), (req, res) => {
  db.sets = db.sets.filter((set) => set.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

/* --- Программа курса (сеты месяцев с модулями) --- */
app.put("/api/program", auth("admin"), (req, res) => {
  const sets = req.body?.sets;
  if (!Array.isArray(sets)) return res.status(400).json({ error: "Нужен массив сетов" });
  db.program = sets;
  saveDb();
  res.json({ ok: true, sets: db.program.length });
});

/* --- Объяснения учителя к встроенным заданиям --- */
app.put("/api/lesson-comments/:lessonId", auth("admin"), (req, res) => {
  const text = String(req.body?.comment ?? "");
  db.lessonComments[req.params.lessonId] = text;
  saveDb();
  res.json({ lessonId: req.params.lessonId, comment: text });
});

/* --- Резервная копия базы --- */
app.get("/api/backup", auth("admin"), (_req, res) => {
  res.setHeader("Content-Disposition", `attachment; filename="chistovik-backup-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json({
    version: 2,
    exportedAt: now(),
    teacher: db.teacher,
    students: db.students,
    tasks: db.tasks,
    tests: db.tests,
    sets: db.sets,
    submissions: db.submissions,
    lessonComments: db.lessonComments,
    program: db.program,
  });
});

app.post("/api/restore", auth("admin"), (req, res) => {
  const payload = req.body || {};
  if (!Array.isArray(payload.tests) || !Array.isArray(payload.tasks))
    return res.status(400).json({ error: "Это не похоже на резервную копию Чистовика" });

  db.students = Array.isArray(payload.students) ? payload.students : db.students;
  db.tasks = payload.tasks;
  db.tests = payload.tests;
  db.sets = Array.isArray(payload.sets) ? payload.sets : [];
  db.submissions = Array.isArray(payload.submissions) ? payload.submissions : [];
  db.lessonComments = payload.lessonComments && typeof payload.lessonComments === "object" ? payload.lessonComments : {};
  if (Array.isArray(payload.program)) db.program = payload.program;
  if (payload.teacher?.name) db.teacher.name = String(payload.teacher.name);
  saveDb();
  res.json({
    ok: true,
    tasks: db.tasks.length,
    tests: db.tests.length,
    sets: db.sets.length,
    submissions: db.submissions.length,
  });
});

/* --- Загрузка mp3 / картинок --- */
app.post("/api/upload", auth("admin"), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Файл не получен" });
  res.status(201).json({
    url: `/media/${req.file.filename}`,
    name: req.file.originalname,
    size: req.file.size,
    mime: req.file.mimetype,
  });
});

/* --- Результаты учеников --- */
app.post("/api/submissions", auth(), (req, res) => {
  const { testId, answers = [], title = "" } = req.body || {};
  const list = Array.isArray(answers) ? answers : [];

  // Автоматическая часть считается на сервере: ученик не может подделать баллы.
  const autoAnswers = list.filter((answer) => answer.correct !== null && answer.correct !== undefined);
  const manualAnswers = list.filter((answer) => answer.correct === null || answer.correct === undefined);
  const score = autoAnswers.reduce((sum, answer) => sum + (Number(answer.earned) || 0), 0);
  const total = list.reduce((sum, answer) => sum + (Number(answer.points) || 1), 0);

  const submission = {
    id: uid("sub"),
    testId: String(testId),
    title: String(title),
    student: req.user.name,
    studentId: req.user.id || "",
    score,
    total,
    autoTotal: autoAnswers.reduce((sum, answer) => sum + (Number(answer.points) || 1), 0),
    manualPoints: manualAnswers.reduce((sum, answer) => sum + (Number(answer.points) || 1), 0),
    manualScore: null,
    comment: "",
    graded: manualAnswers.length === 0,
    answers: list,
    createdAt: now(),
  };
  db.submissions.unshift(submission);
  saveDb();
  res.status(201).json(submission);
});

/** Учитель проверяет развёрнутые ответы: баллы + комментарий */
app.patch("/api/submissions/:id", auth("admin"), (req, res) => {
  const submission = db.submissions.find((item) => item.id === req.params.id);
  if (!submission) return res.status(404).json({ error: "Работа не найдена" });

  const { manualScore, comment } = req.body || {};
  const max = Number(submission.manualPoints) || 0;

  let nextManual = null;
  if (manualScore !== null && manualScore !== undefined && manualScore !== "") {
    nextManual = Math.max(0, Number(manualScore) || 0);
    if (max) nextManual = Math.min(nextManual, max);
  }

  // Итог = автоматические баллы + баллы учителя (автоматику не перезаписываем)
  const autoEarned = (submission.answers || [])
    .filter((answer) => answer.correct !== null && answer.correct !== undefined)
    .reduce((sum, answer) => sum + (Number(answer.earned) || 0), 0);

  submission.autoScore = autoEarned;
  submission.manualScore = nextManual;
  submission.comment = String(comment ?? submission.comment ?? "");
  submission.score = autoEarned + (nextManual ?? 0);
  submission.graded = max === 0 ? true : nextManual !== null;
  submission.checkedAt = now();
  saveDb();
  res.json(submission);
});

app.get("/api/submissions", auth(), (req, res) => {
  const mine = req.user.role !== "admin";
  const list = mine
    ? db.submissions.filter((item) => item.student === req.user.name)
    : db.submissions;
  res.json(req.query.testId ? list.filter((item) => item.testId === req.query.testId) : list);
});

/* --- Ученики --- */
app.get("/api/students", auth("admin"), (_req, res) => {
  const stats = new Map();
  db.submissions.forEach((submission) => {
    const current = stats.get(submission.student) || { attempts: 0, score: 0, total: 0 };
    current.attempts += 1;
    current.score += submission.score;
    current.total += submission.total;
    stats.set(submission.student, current);
  });
  res.json(
    db.students.map(({ passwordHash: _passwordHash, ...student }) => ({
      ...student,
      ...(stats.get(student.name) || { attempts: 0, score: 0, total: 0 }),
    }))
  );
});

/* --- Статика собранного фронтенда --- */
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/media")) return next();
    res.sendFile(path.join(DIST, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  const message = error?.message || "Неизвестная ошибка";
  res.status(error?.status || 400).json({ error: message });
});

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Чистовик API → http://0.0.0.0:${PORT}`);
  console.log(`База: ${DB_FILE}`);
  if (fs.existsSync(DIST)) console.log(`Статика: ${DIST}`);
});
