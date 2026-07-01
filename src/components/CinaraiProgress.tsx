import { CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CINARAI_STAGES, type CinaraiStageId } from '@/components/cinarai/types';

interface CinaraiProgressProps {
  completedStages?: CinaraiStageId[];
  currentStageId?: CinaraiStageId;
}

const journeyStages = CINARAI_STAGES.filter((stage) => stage.id !== 'report');

export function CinaraiProgress({ completedStages = [], currentStageId }: CinaraiProgressProps) {
  const completedSet = new Set(completedStages);

  const getStageState = (stageId: CinaraiStageId) => {
    if (completedSet.has(stageId)) return 'completed';
    if (stageId === currentStageId) return 'current';
    return 'future';
  };

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        CINARAI Syntax
      </div>

      <div className="mt-4 hidden items-center gap-2 md:flex">
        {journeyStages.map((stage, index) => {
          const state = getStageState(stage.id);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div key={stage.id} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center text-center">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300', isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-100' : isCurrent ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_6px_rgba(59,130,246,0.16)]' : 'border-slate-200 bg-slate-100 text-slate-400')}>
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : stage.code}
                </div>
                <p className={cn('mt-1 text-[10px] font-semibold leading-tight', isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-500')}>{stage.title}</p>
              </div>
              {index < journeyStages.length - 1 ? (
                <div className={cn('hidden h-[2px] flex-1 md:block', isCompleted ? 'bg-emerald-400' : isCurrent ? 'bg-blue-400' : 'bg-slate-200')} />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 md:hidden">
        {journeyStages.map((stage) => {
          const state = getStageState(stage.id);
          const isCompleted = state === 'completed';
          const isCurrent = state === 'current';

          return (
            <div key={stage.id} className="flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300', isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-100' : isCurrent ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_6px_rgba(59,130,246,0.16)]' : 'border-slate-200 bg-slate-100 text-slate-400')}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : stage.code}
              </div>
              <div className="min-w-0">
                <p className={cn('text-sm font-semibold', isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-500')}>{stage.title}</p>
                <p className={cn('text-xs', isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400')}>{isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Locked'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
