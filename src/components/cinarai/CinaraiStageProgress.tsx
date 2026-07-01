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
  const currentStage = CINARAI_STAGES.find((stage) => stage.id === currentStageId) ?? CINARAI_STAGES[0];

  if (compact) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          <span>Sintaks</span>
          <span>{Math.min(completedStages.length + 1, CINARAI_STAGES.length)} / {CINARAI_STAGES.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-semibold text-slate-900">
          <span>{currentStage.title}</span>
          <span className="text-blue-600">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        <span>Alur CINARAI</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-3 bg-white/80" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CINARAI_STAGES.map((stage) => {
          const isCompleted = completedSet.has(stage.id);
          const isCurrent = stage.id === currentStageId;
          const state = isCompleted ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : isCurrent ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-500';

          return (
            <div key={stage.id} className={`min-h-16 rounded-lg border p-2 text-[10px] font-semibold ${state}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white ${stage.color}`}>
                  {stage.code}
                </span>
                <span className="leading-tight">{stage.title}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-tight opacity-80">{stage.subtitle}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
