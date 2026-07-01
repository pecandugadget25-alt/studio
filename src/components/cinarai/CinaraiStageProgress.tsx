import { CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CINARAI_STAGES, CinaraiStageId } from './types';

interface CinaraiStageProgressProps {
  completedStages: CinaraiStageId[];
  currentStageId: CinaraiStageId;
  compact?: boolean;
}

const journeyStages = CINARAI_STAGES.filter((stage) => stage.id !== 'report');

export function CinaraiStageProgress({ completedStages, currentStageId, compact = false }: CinaraiStageProgressProps) {
  const completedSet = new Set(completedStages);
  const progress = Math.round((completedStages.length / journeyStages.length) * 100);
  const currentStage = journeyStages.find((stage) => stage.id === currentStageId) ?? journeyStages[0];

  const getStageState = (stageId: CinaraiStageId) => {
    if (completedSet.has(stageId)) return 'completed';
    if (stageId === currentStageId) return 'current';
    return 'future';
  };

  const renderNode = (stage: (typeof journeyStages)[number], state: 'completed' | 'current' | 'future') => {
    const isCompleted = state === 'completed';
    const isCurrent = state === 'current';

    return (
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'relative flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm transition-all duration-300',
            isCompleted
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-100'
              : isCurrent
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_6px_rgba(59,130,246,0.16)]'
                : 'border-slate-200 bg-slate-100 text-slate-400'
          )}
        >
          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span>{stage.code}</span>}
          {isCurrent ? <span className="absolute inset-0 rounded-full ring-4 ring-blue-100" /> : null}
        </div>
        <div className="mt-2 max-w-[72px]">
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', isCompleted ? 'text-emerald-600' : isCurrent ? 'text-blue-700' : 'text-slate-400')}>
            {stage.code}
          </p>
          <p className={cn('mt-1 text-[11px] font-semibold leading-tight', isCompleted ? 'text-emerald-700' : isCurrent ? 'text-blue-700' : 'text-slate-500')}>
            {stage.title}
          </p>
        </div>
      </div>
    );
  };

  if (compact) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          <span>Journey</span>
          <span>{Math.min(completedStages.length + 1, journeyStages.length)} / {journeyStages.length}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{currentStage.title}</p>
            <p className="text-xs text-slate-500">{progress}% selesai</p>
          </div>
          <div className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{progress}%</div>
        </div>
        <div className="mt-3 flex flex-col gap-2 md:hidden">
          {journeyStages.map((stage) => {
            const state = getStageState(stage.id);
            return (
              <div key={stage.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {renderNode(stage, state)}
                </div>
                {stage.id !== journeyStages[journeyStages.length - 1].id ? (
                  <div className={cn('h-8 w-px', state === 'completed' ? 'bg-emerald-400' : state === 'current' ? 'bg-blue-400' : 'bg-slate-200')} />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-3 hidden items-center gap-2 md:flex">
          {journeyStages.map((stage, index) => {
            const state = getStageState(stage.id);
            return (
              <div key={stage.id} className="flex flex-1 items-center gap-2">
                {renderNode(stage, state)}
                {index < journeyStages.length - 1 ? (
                  <div className={cn('hidden h-[2px] flex-1 md:block', state === 'completed' ? 'bg-emerald-400' : state === 'current' ? 'bg-blue-400' : 'bg-slate-200')} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Alur CINARAI</span>
        </div>
        <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{progress}%</div>
      </div>

      <div className="hidden flex-col gap-3 md:flex md:flex-row md:items-start md:justify-between">
        {journeyStages.map((stage, index) => {
          const state = getStageState(stage.id);
          return (
            <div key={stage.id} className="flex flex-1 items-center gap-3">
              {renderNode(stage, state)}
              {index < journeyStages.length - 1 ? (
                <div className={cn('hidden h-[2px] flex-1 md:block', state === 'completed' ? 'bg-emerald-400' : state === 'current' ? 'bg-blue-400' : 'bg-slate-200')} />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {journeyStages.map((stage) => {
          const state = getStageState(stage.id);
          return (
            <div key={stage.id} className="flex items-center gap-3">
              {renderNode(stage, state)}
              <div className={cn('h-8 w-px', state === 'completed' ? 'bg-emerald-400' : state === 'current' ? 'bg-blue-400' : 'bg-slate-200')} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
