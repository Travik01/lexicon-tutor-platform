import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Library, 
  Plus, 
  Sparkles 
} from "lucide-react";
import AssignmentsView, { type SavedLessonResult } from "./AssignmentsView";
import CreateTask from "./CreateTask";
import VocabBuilder from "./VocabBuilder";
import LexisLab from "./LexisLab";
import type { Assignment } from "../../data/mock";
import type { LessonVocabSet } from "../../data/vocabulary";

type HubTab = "library" | "create-task" | "create-vocab" | "lexis";

export default function AssignmentsHub({
  isAdmin,
  assignments,
  customVocabSets,
  onAddAssignment,
  onOpenAssignment,
  onToggleAssignmentStatus,
  onDeleteAssignment,
  onSaveVocab,
  lessonResults,
  onAward,
}: {
  isAdmin: boolean;
  assignments: Assignment[];
  customVocabSets: LessonVocabSet[];
  onAddAssignment: (a: Assignment) => void;
  onOpenAssignment: (a: Assignment) => void;
  onToggleAssignmentStatus?: (id: string) => void;
  onDeleteAssignment?: (id: string) => void;
  onSaveVocab: (set: LessonVocabSet) => void;
  lessonResults: Record<string, SavedLessonResult>;
  onAward: (pts: number) => void;
}) {
  const [tab, setTab] = useState<HubTab>("library");

  const TABS = [
    { id: "library", label: "Библиотека", icon: Library },
    { id: "lexis", label: "Lexis Lab", icon: BookOpen },
    ...(isAdmin ? [
      { id: "create-task", label: "Новое задание", icon: Sparkles },
      { id: "create-vocab", label: "Новый набор слов", icon: Plus },
    ] : [])
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 no-scrollbar overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as HubTab)}
            className={
              "pressable relative inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold transition-all " +
              (tab === t.id ? "bg-ink text-paper" : "bg-white text-ink-soft hover:bg-ink/5 hover:text-ink")
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "library" && (
            <AssignmentsView
              assignments={assignments}
              onCreate={isAdmin ? () => setTab("create-task") : undefined}
              onOpen={onOpenAssignment}
              onToggleStatus={onToggleAssignmentStatus}
              onDelete={onDeleteAssignment}
              results={lessonResults}
              readOnly={!isAdmin}
            />
          )}

          {tab === "lexis" && (
            <LexisLab
              customSets={customVocabSets}
              onCreateSet={isAdmin ? () => setTab("create-vocab") : undefined}
              onAward={onAward}
            />
          )}

          {tab === "create-task" && isAdmin && (
            <CreateTask onCreated={(a) => {
              onAddAssignment(a);
              setTab("library");
            }} />
          )}

          {tab === "create-vocab" && isAdmin && (
            <VocabBuilder
              onSave={(set) => {
                onSaveVocab(set);
                setTab("lexis");
              }}
              onBack={() => setTab("lexis")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
