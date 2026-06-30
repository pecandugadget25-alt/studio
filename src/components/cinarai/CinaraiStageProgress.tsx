import { Progress } from '@/components/ui/progress';
import { CINARAI_STAGES, CinaraiStageId } from './types';

interface CinaraiStageProgressProps {
  completedStages: CinaraiStageId[];
  currentStageId: CinaraiStageId;
  compact?: boolean;
}

export function CinaraiStageProgress({ completedStages, currentStageId, compact = false }: CinaraiStageProgressProps) {
  const completedSet = new Set(completedStages);
  const progress = Math.round((completedStages.length / CINARAI_STAGES.length) * 100);

  if (compact) {
    return (
      <div className="rounded-[1.25rem] border border-orange-100 bg-white/90 p-3 shadow-sm">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          <span>Stage</span>
          <span>{Math.min(completedStages.length + 1, CINARAI_STAGES.length)} / {CINARAI_STAGES.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-900">
          <span>{CINARAI_STAGES.find((stage) => stage.id === currentStageId)?.title ?? 'Contextualization'}</span>
          <span className="text-orange-600">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.5rem] bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-inner">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        <span>Progres CINARAI</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-3 bg-white/80" />
      <div className="grid grid-cols-3 gap-2">
        {CINARAI_STAGES.map((stage) => {
          const isCompleted = completedSet.has(stage.id);
          const isCurrent = stage.id === currentStageId;
          const state = isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-orange-500' : 'bg-slate-200';

          return (
            <div key={stage.id} className="rounded-2xl bg-white/80 p-2 text-center text-[10px] font-semibold text-slate-600">
              <div className={`mx-auto mb-1 h-2.5 w-2.5 rounded-full ${state}`} />
              <div className="leading-tight">{stage.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
