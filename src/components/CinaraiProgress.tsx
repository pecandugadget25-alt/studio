import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

const stages = [
  { label: 'Cover', completed: true },
  { label: 'Contextualization', completed: true },
  { label: 'Identification', completed: false },
  { label: 'Navigation', completed: false },
  { label: 'Argumentation', completed: false },
  { label: 'Resolution', completed: false },
  { label: 'Application', completed: false },
  { label: 'Introspection', completed: false },
];

export function CinaraiProgress() {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        CINARAI Syntax
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {stages.map((stage) => (
          <div
            key={stage.label}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
              stage.completed
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            {stage.completed ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            <span>{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
