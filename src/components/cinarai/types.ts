export type CinaraiStageId =
  | 'cover'
  | 'contextualization'
  | 'identification'
  | 'navigation'
  | 'argumentation'
  | 'resolution'
  | 'application'
  | 'introspection'
  | 'report';

export interface CinaraiStageConfig {
  id: CinaraiStageId;
  title: string;
  subtitle: string;
  icon: string;
}

export interface CinaraiStagePayload {
  completed: boolean;
  completedAt?: string;
  score?: number;
  feedback?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface CinaraiSessionData {
  userId: string;
  startedAt?: string;
  updatedAt?: string;
  completedStages: CinaraiStageId[];
  stageData: Record<string, CinaraiStagePayload>;
  aiInteractions: number;
  xp: number;
  badges: string[];
  masteryPercentage: number;
  durationSeconds: number;
  reflection?: string;
}

export const CINARAI_STAGES: CinaraiStageConfig[] = [
  { id: 'cover', title: 'Cover', subtitle: 'Mulai petualangan', icon: '✨' },
  { id: 'contextualization', title: 'Contextualization', subtitle: 'Baca komik cerita', icon: '📖' },
  { id: 'identification', title: 'Identification', subtitle: 'Kenali bentuk dan pola', icon: '🧠' },
  { id: 'navigation', title: 'Navigation', subtitle: 'Jelajah AR dan AI', icon: '📷' },
  { id: 'argumentation', title: 'Argumentation', subtitle: 'Jelaskan alasanmu', icon: '💬' },
  { id: 'resolution', title: 'Resolution', subtitle: 'Selesaikan soal numerasi', icon: '🧮' },
  { id: 'application', title: 'Application', subtitle: 'Pakai di dunia nyata', icon: '🌍' },
  { id: 'introspection', title: 'Introspection', subtitle: 'Refleksi belajar', icon: '🪴' },
  { id: 'report', title: 'Report', subtitle: 'Lihat hasil belajar', icon: '🏅' },
];
