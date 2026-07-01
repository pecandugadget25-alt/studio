import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { CINARAI_STAGES, type CinaraiStageId } from '@/components/cinarai/types';

interface CinaraiProgressProps {
  completedStages?: CinaraiStageId[];
  currentStageId?: CinaraiStageId;
}

export function CinaraiProgress({ completedStages = [], currentStageId }: CinaraiProgressProps) {
  const completedSet = new Set(completedStages);

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        CINARAI Syntax
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CINARAI_STAGES.filter((stage) => stage.id !== 'report').map((stage) => {
          const isCompleted = completedSet.has(stage.id);
          const isCurrent = currentStageId === stage.id;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : isCurrent
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span>{stage.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
