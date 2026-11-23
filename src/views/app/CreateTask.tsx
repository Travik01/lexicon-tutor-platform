import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Layers, ListChecks, PenLine, PartyPopper, RotateCcw, Zap } from "lucide-react";
import { CODE_WORDS, type Assignment } from "../../data/mock";
import type { Lesson, LessonFormat, LessonQuestion } from "../../data/lessons";
import { CodeChip, FormatBadge, Panel, SectionTitle } from "./shared";

const FORMATS: { value: Assignment["format"]; icon: typeof Zap }[] = [
  { value: "Квиз", icon: Zap },
  { value: "Карточки", icon: Layers },
  { value: "Блиц", icon: ListChecks },
  { value: "Задачи", icon: PenLine },
];

const QUESTION_BANK: LessonQuestion[] = [
  { id: "custom-1", prompt: "Choose the correct form: She ___ English every day.", options: ["study", "studies", "is study"], correct: 1, explanation: "С she в Present Simple используется окончание -s: studies." },
  { id: "custom-2", prompt: "I ___ this film yesterday.", options: ["have seen", "saw", "see"], correct: 1, explanation: "Yesterday требует Past Simple: saw." },
  { id: "custom-3", prompt: "What does ‘reliable’ mean?", options: ["надёжный", "редкий", "вежливый"], correct: 0, explanation: "Reliable — надёжный, тот, на кого можно положиться." },
  { id: "custom-4", prompt: "If it rains, we ___ at home.", options: ["will stay", "stayed", "would have stayed"], correct: 0, explanation: "First Conditional: if + Present Simple, will + verb." },
  { id: "custom-5", prompt: "‘Put off’ means...", options: ["отложить", "надеть", "выключить"], correct: 0, explanation: "Put off — отложить действие на потом." },
  { id: "custom-6", prompt: "There aren't ___ chairs in the room.", options: ["much", "enough", "a little"], correct: 1, explanation: "Enough chairs — достаточно стульев." },
  { id: "custom-7", prompt: "She said she ___ tired.", options: ["is", "was", "will"], correct: 1, explanation: "В косвенной речи am/is обычно сдвигается в was." },
  { id: "custom-8", prompt: "My brother enjoys ___ new people.", options: ["meet", "meeting", "to met"], correct: 1, explanation: "После enjoy используется герундий: meeting." },
  { id: "custom-9", prompt: "Choose the synonym of ‘huge’.", options: ["tiny", "enormous", "quiet"], correct: 1, explanation: "Huge и enormous означают «огромный»." },
  { id: "custom-10", prompt: "By 8 p.m. I ___ the work.", options: ["finish", "will have finished", "am finish"], correct: 1, explanation: "Завершение к моменту в будущем: Future Perfect." },
  { id: "custom-11", prompt: "Which sentence is correct?", options: ["He don't know.", "He doesn't know.", "He not knows."], correct: 1, explanation: "Отрицание в Present Simple с he: doesn't + infinitive." },
  { id: "custom-12", prompt: "‘Once in a blue moon’ means...", options: ["very often", "very rarely", "at night"], correct: 1, explanation: "Идиома означает «крайне редко»." },
  { id: "custom-13", prompt: "We ___ here for five years.", options: ["live", "lived", "have lived"], correct: 2, explanation: "For five years до настоящего момента: Present Perfect." },
  { id: "custom-14", prompt: "Choose the correct article: ___ Earth moves around the Sun.", options: ["A", "The", "—"], correct: 1, explanation: "Уникальные объекты используются с the." },
  { id: "custom-15", prompt: "I wish I ___ more free time.", options: ["have", "had", "will have"], correct: 1, explanation: "Wish о настоящем + Past Simple: had." },
  { id: "custom-16", prompt: "The opposite of ‘polite’ is...", options: ["patient", "rude", "honest"], correct: 1, explanation: "Rude — грубый, невежливый." },
  { id: "custom-17", prompt: "The train ___ at 7 tomorrow.", options: ["leaves", "will leaving", "leave"], correct: 0, explanation: "Расписание выражается Present Simple: leaves." },
  { id: "custom-18", prompt: "He is interested ___ science.", options: ["on", "in", "at"], correct: 1, explanation: "Устойчивое сочетание: interested in." },
  { id: "custom-19", prompt: "If I ___ you, I would talk to the teacher.", options: ["am", "were", "had been"], correct: 1, explanation: "Совет: If I were you." },
  { id: "custom-20", prompt: "Choose the correct spelling.", options: ["succesful", "successful", "successfull"], correct: 1, explanation: "Правильное написание: successful." },
];

function buildCustomLesson(
  id: string,
  title: string,
  format: LessonFormat,
  code: string,
  count: number,
  note: string
): Lesson {
  const cardPairs = [
    ["achievement", "достижение", "Winning the competition was a great achievement."],
    ["reliable", "надёжный", "She is a reliable friend."],
    ["to improve", "улучшать", "Daily practice improves your English."],
    ["however", "однако", "The task was hard; however, we finished it."],
    ["to avoid", "избегать", "Try to avoid common mistakes."],
    ["confident", "уверенный", "He feels confident before the test."],
    ["to achieve", "достигать", "You can achieve your goal."],
    ["despite", "несмотря на", "Despite the rain, we went out."],
  ];
  const selected: LessonQuestion[] = Array.from({ length: count }, (_, index) => {
    if (format === "Карточки") {
      const [prompt, answer, example] = cardPairs[index % cardPairs.length];
      return { id: `${id}-${index}`, prompt, answer, example };
    }
    const original = QUESTION_BANK[index % QUESTION_BANK.length];
    return { ...original, id: `${id}-${index}` };
  });
  return {
    id,
    title,
    topic: "Задание учителя",
    format,
    level: "B1",
    duration: Math.max(4, Math.round(count * 0.8)),
    description: note.trim() || "Практический набор, собранный учителем для класса.",
    code,
    source: "Авторская подборка",
    questions: selected,
  };
}

export default function CreateTask({
  onCreated,
}: {
  onCreated: (a: Assignment) => void;
}) {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Английский");
  const [format, setFormat] = useState<Assignment["format"]>("Квиз");
  const [count, setCount] = useState(8);
  const [note, setNote] = useState("");
  const [created, setCreated] = useState<Assignment | null>(null);

  const SUBJECTS = ["Английский", "Грамматика", "Лексика", "Чтение", "Олимпиада"];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
    const num = Math.floor(10 + Math.random() * 89);
    const deadline = new Date(Date.now() + 7 * 864e5).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });
    const id = `new-${Date.now()}`;
    const title = topic.trim() || "Present Perfect";
    const code = `${word}-${num}`;
    const customLesson = buildCustomLesson(id, title, format, code, count, note);
    const a: Assignment = {
      id,
      title,
      topic: subject,
      format,
      code,
      done: 0,
      total: 28,
      deadline: `до ${deadline}`,
      status: "active",
      level: "B1",
      duration: customLesson.duration,
      itemCount: count,
      description: customLesson.description,
      source: "Создано учителем",
      customLesson,
    };
    onCreated(a);
    setCreated(a);
  };

  const reset = () => {
    setCreated(null);
    setTopic("");
    setNote("");
    setCount(8);
    setFormat("Квиз");
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Новое задание"
        hint="Укажите тему, формат и количество вопросов — код для учеников сгенерируется автоматически"
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* Форма */}
        <Panel className="p-6 sm:p-7">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="task-topic" className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                 Тема
              </label>
              <input
                id="task-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Present Perfect, Phrasal verbs, Unit 5..."
                className="mt-2 w-full rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-3.5 text-[15px] font-bold transition-all outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
              />
            </div>

            <div>
              <label
                htmlFor="task-subject"
                className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase"
              >
                Область
              </label>
              <select
                id="task-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-2 w-full cursor-pointer rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-3.5 text-[15px] font-bold outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                Формат подачи
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FORMATS.map((f) => (
                  <button
                    type="button"
                    key={f.value}
                    onClick={() => setFormat(f.value)}
                    className={
                      "pressable flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-[13px] font-extrabold transition-all " +
                      (format === f.value
                        ? "border-accent bg-accent/8 text-accent-deep shadow-[0_10px_24px_-14px_rgba(108,77,246,0.6)]"
                        : "border-line bg-white text-ink-soft hover:border-ink/25")
                    }
                  >
                    <f.icon className="h-5 w-5" />
                    {f.value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                  Количество вопросов
                </span>
                <span className="font-display text-lg font-bold text-accent-deep tabular-nums">
                  {count}
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="mt-3 w-full accent-accent"
                aria-label="Количество вопросов"
              />
            </div>

            <div>
              <label htmlFor="task-note" className="text-xs font-extrabold tracking-[0.16em] text-ink/45 uppercase">
                Комментарий <span className="normal-case text-ink/30">(необязательно)</span>
              </label>
              <textarea
                id="task-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Описание задания для учеников"
                className="mt-2 w-full resize-none rounded-2xl border-2 border-line bg-paper/60 px-4.5 py-3.5 text-sm font-semibold transition-all outline-none focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15"
              />
            </div>

            <button
              type="submit"
              className="pressable group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-ink py-4 font-display text-sm font-bold text-paper shadow-[0_18px_36px_-14px_rgba(27,23,18,0.55)] transition-all hover:bg-accent"
            >
              Создать и получить код
              <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </Panel>

        {/* Предпросмотр / результат */}
        <div className="lg:sticky lg:top-24">
          <AnimatePresence mode="wait">
            {created ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                className="relative overflow-hidden rounded-[24px] border border-white/10 bg-ink p-7 text-paper shadow-[0_32px_64px_-28px_rgba(27,23,18,0.6)]"
              >
                <div className="grid-paper-dark pointer-events-none absolute inset-0" aria-hidden />
                <div className="relative">
                  <p className="flex items-center gap-2 text-sm font-extrabold text-hl">
                    <PartyPopper className="h-4.5 w-4.5" />
                    Готово
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold">{created.title}</p>
                  <p className="mt-1 text-sm font-bold text-paper/55">
                    {created.format} · {count} вопросов · {created.deadline}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-hl/25 bg-hl/10 px-5 py-4">
                    <span className="font-display text-2xl font-bold tracking-[0.08em] text-hl">
                      {created.code}
                    </span>
                    <CodeChip code={created.code} dark />
                  </div>

                  <p className="mt-4 text-[13px] leading-relaxed font-semibold text-paper/55">
                    Отправьте этот код ученикам. Результаты появятся во вкладке «Задания».
                  </p>

                  <button
                    onClick={reset}
                    className="pressable mt-5 inline-flex items-center gap-2 rounded-xl border border-paper/20 px-4 py-2.5 text-xs font-extrabold transition-colors hover:border-hl hover:text-hl"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Создать ещё одно
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <Panel className="p-6 sm:p-7">
                   <p className="text-[11px] font-extrabold tracking-[0.2em] text-ink/40 uppercase">
                    Предварительный просмотр
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <FormatBadge format={format} />
                    <div>
                      <p className="font-display text-lg leading-tight font-semibold">
                        {topic.trim() || "Present Perfect"}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-ink-soft/70">
                        {format} · {count} вопросов
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-1.5">
                    {Array.from({ length: Math.min(count, 12) }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          "h-1.5 flex-1 rounded-full " + (i === 0 ? "bg-accent" : "bg-paper-3")
                        }
                      />
                    ))}
                  </div>
                  {note.trim() && (
                    <p className="mt-4 rounded-xl bg-paper-2/70 px-4 py-3 text-[13px] font-semibold text-ink-soft">
                      «{note.trim()}»
                    </p>
                  )}
                </Panel>
                <Panel className="border-dashed bg-paper-2/50 p-5">
                  <p className="text-sm font-semibold text-ink/30">
                    Код появится после создания
                  </p>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
