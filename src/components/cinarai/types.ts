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
  code: string;
  color: string;
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
  currentPage?: number;
  totalPages?: number;
  readingCompleted?: boolean;
}

export const CINARAI_STAGES: CinaraiStageConfig[] = [
  { id: 'cover', title: 'Cover Komik', subtitle: 'Mulai petualangan Candi Jawi', code: '1', color: 'bg-slate-700' },
  { id: 'contextualization', title: 'Contextualization', subtitle: 'Hubungkan cerita dengan konteks nyata', code: 'C', color: 'bg-blue-600' },
  { id: 'identification', title: 'Identification', subtitle: 'Temukan informasi dan bentuk penting', code: 'I', color: 'bg-teal-600' },
  { id: 'navigation', title: 'Navigation', subtitle: 'Jelajah AR dan tanya AI', code: 'N', color: 'bg-green-600' },
  { id: 'argumentation', title: 'Argumentation', subtitle: 'Bangun alasan logis', code: 'A', color: 'bg-orange-500' },
  { id: 'resolution', title: 'Resolution', subtitle: 'Tentukan solusi numerasi terbaik', code: 'R', color: 'bg-red-500' },
  { id: 'application', title: 'Application', subtitle: 'Terapkan pada konteks baru', code: 'A', color: 'bg-violet-600' },
  { id: 'introspection', title: 'Introspection', subtitle: 'Refleksi dan pengaturan diri', code: 'I', color: 'bg-sky-600' },
  { id: 'report', title: 'Laporan Hasil', subtitle: 'Lihat poin, level, dan badge', code: 'H', color: 'bg-amber-500' },
];
