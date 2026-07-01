import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';
import { CINARAI_STAGES, CinaraiSessionData } from './types';

interface ReportStageProps {
  session: CinaraiSessionData;
  onComplete: () => void;
}

export function ReportStage({ session, onComplete }: ReportStageProps) {
  const learningStages = CINARAI_STAGES.filter((stage) => stage.id !== 'report');
  const completedCount = session.completedStages.filter((stage) => stage !== 'report').length;
  const mastery = Math.round((completedCount / learningStages.length) * 100);
  const badgeLabel = mastery >= 80 ? 'Master Numerasi' : 'Pemula Aktif';

  const summary = useMemo(() => [
    { label: 'Tahap selesai', value: `${completedCount}/${learningStages.length}` },
    { label: 'Durasi', value: `${Math.round(session.durationSeconds / 60)} menit` },
    { label: 'Interaksi AI', value: `${session.aiInteractions}` },
    { label: 'XP', value: `${session.xp}` },
    { label: 'Peringkat', value: `#${Math.max(1, 12 - completedCount)}` },
  ], [completedCount, session.aiInteractions, session.durationSeconds, session.xp]);

  return (
    <StageShell title="Laporan Belajar" subtitle="Ringkasan poin, level, badge, dan skor tiap sintaks" badge="Hasil" code="H" tone="bg-amber-500">
      <div className="space-y-4">
        <Card className="rounded-lg border-none bg-emerald-600 p-4 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em]">Mastery</p>
          <h4 className="mt-2 text-3xl font-bold">{mastery}%</h4>
          <p className="mt-2 text-sm">{badgeLabel}</p>
        </Card>
        <div className="grid gap-2 sm:grid-cols-2">
          {summary.map((item) => (
            <div key={item.label} className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              <p className="mt-1 font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Tahap yang selesai</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.completedStages.map((stage) => (
              <Badge key={stage} className="rounded-md bg-blue-50 text-blue-700">{stage}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Refleksi</p>
          <p className="mt-2">{session.reflection || 'Belum ada refleksi tersimpan.'}</p>
        </div>
        <Button onClick={onComplete} className="w-full rounded-lg bg-emerald-600 py-6 text-base font-semibold hover:bg-emerald-700">
          Kembali ke daftar komik
        </Button>
      </div>
    </StageShell>
  );
}
