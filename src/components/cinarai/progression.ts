import { CINARAI_STAGES, CinaraiStageId } from './types';

export function getNextStageId(completedStages: CinaraiStageId[]): CinaraiStageId {
  const completedSet = new Set(completedStages);
  const currentIndex = CINARAI_STAGES.findIndex((stage) => !completedSet.has(stage.id));
  if (currentIndex === -1) return 'report';
  return CINARAI_STAGES[currentIndex].id;
}

export function calculateMasteryPercentage(completedStages: CinaraiStageId[]): number {
  if (completedStages.length === 0) return 0;
  return Math.round((completedStages.length / CINARAI_STAGES.length) * 100);
}

export function calculateSessionXp(completedStages: CinaraiStageId[]): number {
  return completedStages.length * 25;
}
