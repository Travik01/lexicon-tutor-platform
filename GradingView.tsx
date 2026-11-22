import { useState } from "react";
import { Clock, MessageSquare, Send } from "lucide-react";
import { Panel, SectionTitle } from "./shared";

type Submission = {
  id: string;
  student: string;
  lessonName: string;
  type: "text" | "audio";
  content: string;
  submittedAt: string;
  maxScore: number;
};

// Ответы учеников появляются здесь по мере выполнения заданий
const INITIAL_SUBMISSIONS: Submission[] = [];

export default function GradingView() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState("");

  const submitGrade = () => {
    if (!selected) return;
    setSubmissions(s => s.filter(x => x.id !== selected.id));
    setSelected(null);
    setScore("");
    setFeedback("");

  };

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Проверка заданий" 
        hint="Ответы учеников, ожидающие оценки и комментариев" 
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Список на проверку */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-ink/40 uppercase tracking-widest">Ожидают проверки ({submissions.length})</h3>
          {submissions.length === 0 ? (
            <Panel className="p-6 text-center border-dashed bg-paper/50">
              <Clock className="h-8 w-8 text-ink/20 mx-auto mb-2" />
              <p className="text-sm font-bold text-ink-soft">Работ пока нет</p>
              <p className="text-xs font-semibold text-ink/35 mt-1">Ответы появятся после выполнения заданий</p>
            </Panel>
          ) : (
            submissions.map(sub => (
              <button
                key={sub.id}
                onClick={() => { setSelected(sub); setScore(""); setFeedback(""); }}
                className={`pressable w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  selected?.id === sub.id 
                    ? "border-accent bg-accent/5 shadow-md" 
                    : "border-line bg-white hover:border-ink/20"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold">{sub.student}</p>
                  <span className="text-[10px] font-extrabold bg-paper-3 px-2 py-0.5 rounded-full text-ink/50">{sub.type}</span>
                </div>
                <p className="text-xs font-semibold text-ink/60 mt-1 truncate">{sub.lessonName}</p>
                <p className="text-[10px] font-bold text-ink/40 mt-2">{sub.submittedAt}</p>
              </button>
            ))
          )}
        </div>

        {/* Панель проверки */}
        <div>
          {selected ? (
            <Panel className="p-6 sm:p-8 flex flex-col h-full min-h-[500px]">
              <div className="border-b border-line/70 pb-4 mb-4">
                <h2 className="font-display text-xl font-bold">{selected.student}</h2>
                <p className="text-sm font-semibold text-ink-soft">{selected.lessonName}</p>
              </div>

              <div className="flex-1 bg-paper-2/50 rounded-2xl p-5 border border-line">
                <p className="text-xs font-extrabold text-ink/40 uppercase tracking-widest mb-3">Ответ ученика</p>
                {selected.type === "text" ? (
                  <p className="text-sm leading-relaxed font-medium">{selected.content}</p>
                ) : (
                  <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-line inline-flex">
                     <button className="h-10 w-10 bg-accent text-white rounded-full flex items-center justify-center">
                        ▶
                     </button>
                     <div className="h-2 w-32 bg-paper-3 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-1/3" />
                     </div>
                     <span className="text-xs font-bold tabular-nums">0:15 / 1:20</span>
                  </div>
                )}
              </div>

              <div className="mt-6 grid sm:grid-cols-[100px_1fr] gap-4 items-start">
                <div>
                  <label className="text-xs font-extrabold text-ink/45 uppercase">Оценка</label>
                  <div className="mt-2 relative">
                    <input 
                      type="number"
                      value={score}
                      onChange={e => setScore(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border-2 border-line rounded-xl px-4 py-3 font-display font-bold outline-none focus:border-accent"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink/30">
                      / {selected.maxScore}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-extrabold text-ink/45 uppercase">Комментарий</label>
                  <textarea 
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Напиши разбор ошибок..."
                    rows={3}
                    className="mt-2 w-full bg-white border-2 border-line rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>

              <button
                onClick={submitGrade}
                disabled={!score}
                className="mt-6 pressable self-end inline-flex items-center gap-2 bg-ink text-paper px-8 py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50 hover:bg-mint"
              >
                <Send className="h-4 w-4" />
                Отправить результат
              </button>
            </Panel>
          ) : (
            <Panel className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 border-dashed bg-paper-2/30 text-center">
              <MessageSquare className="h-12 w-12 text-ink/20 mb-4" />
              <h3 className="font-display text-lg font-semibold">Выберите работу</h3>
              <p className="text-sm font-medium text-ink-soft mt-1">
                Кликните по карточке слева, чтобы начать проверку.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
