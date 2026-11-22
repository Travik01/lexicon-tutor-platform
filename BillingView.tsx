import { useState } from "react";
import { Check, Sparkles, Users } from "lucide-react";
import { Panel, SectionTitle } from "./shared";

const PLANS = [
  {
    id: "basic",
    name: "Тариф до 5 учеников",
    price: "1 500 ₽",
    period: "в месяц",
    features: ["До 5 активных учеников", "Проверка заданий", "Все 12 сетов программы", "Базовая статистика"],
    limit: 5,
  },
  {
    id: "pro",
    name: "Тариф до 10 учеников",
    price: "2 800 ₽",
    period: "в месяц",
    features: ["До 10 активных учеников", "Проверка заданий", "Все 12 сетов программы", "Расширенная статистика", "Приоритетная поддержка"],
    limit: 10,
    popular: true,
  },
  {
    id: "school",
    name: "Школа (Безлимит)",
    price: "Индивидуально",
    period: "",
    features: ["Неограниченно учеников", "Доступ для всех преподавателей школы", "Кастомизация сетов", "API интеграции"],
    limit: Infinity,
  }
];

export default function BillingView() {
  const [currentPlan, setCurrentPlan] = useState("school"); // По мок-данным у нас 28 учеников
  const activeStudents = 28;

  return (
    <div className="space-y-6">
      <SectionTitle 
        title="Тарифы и оплата" 
        hint="Управление подпиской и лимитами учеников" 
      />

      <Panel className="p-6 bg-ink text-paper relative overflow-hidden">
        <div className="grid-paper-dark absolute inset-0 opacity-10" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-paper/40">Текущий тариф</p>
            <h3 className="mt-1 font-display text-2xl font-bold text-hl">
              {PLANS.find(p => p.id === currentPlan)?.name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-paper/70">
              Следующий платеж: <span className="text-white">15 апреля 2026</span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4">
            <div className="h-12 w-12 rounded-full bg-hl text-ink flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold tabular-nums">
                {activeStudents} <span className="text-sm font-normal text-paper/60">/ {PLANS.find(p => p.id === currentPlan)?.limit === Infinity ? '∞' : PLANS.find(p => p.id === currentPlan)?.limit}</span>
              </p>
              <p className="text-xs font-bold text-paper/40 uppercase">активных учеников</p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map(plan => {
          const isActive = currentPlan === plan.id;
          const requiresUpgrade = activeStudents > plan.limit;

          return (
            <Panel 
              key={plan.id} 
              className={`relative p-6 flex flex-col ${plan.popular && !isActive ? "border-accent/50 shadow-lg" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Популярный
                </span>
              )}
              <h4 className="font-display text-lg font-bold">{plan.name}</h4>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-accent-deep">{plan.price}</span>
                <span className="text-xs font-bold text-ink/40">{plan.period}</span>
              </div>
              
              <ul className="mt-6 mb-8 space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm font-semibold text-ink-soft">
                    <Check className="h-4 w-4 text-mint shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={isActive || requiresUpgrade}
                onClick={() => setCurrentPlan(plan.id)}
                className={`w-full py-3 rounded-2xl text-sm font-bold transition-colors ${
                  isActive 
                    ? "bg-mint/10 text-[#13683f] cursor-default" 
                    : requiresUpgrade
                      ? "bg-paper-2 text-ink/30 cursor-not-allowed"
                      : "bg-ink text-paper hover:bg-accent"
                }`}
              >
                {isActive 
                  ? "Текущий тариф" 
                  : requiresUpgrade 
                    ? "Превышен лимит учеников" 
                    : "Перейти на тариф"}
              </button>
            </Panel>
          );
        })}
      </div>
      
      <Panel className="border-dashed bg-paper-2/45 p-5 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-accent shrink-0" />
        <p className="text-sm font-semibold text-ink-soft">
          Стоимость зависит от количества оставшихся сетов в учебном году. 
          Доступ к каждому сету действует до конца соответствующего месяца.
        </p>
      </Panel>
    </div>
  );
}
