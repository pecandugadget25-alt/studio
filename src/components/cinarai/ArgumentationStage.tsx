import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StageShell } from './StageShell';

interface ArgumentationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function ArgumentationStage({ onComplete, onAiAssist }: ArgumentationStageProps) {
  const [reasoning, setReasoning] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist(`Nilai alasan berikut dengan rubrik: benar 5 poin, alasan lengkap 10 poin, memakai istilah matematika 10 poin. Pertanyaan: Mengapa bagian tubuh Candi Jawi dapat dimodelkan sebagai kubus atau balok? Alasan siswa: ${reasoning}`);
      setFeedback(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Argumentation" subtitle="Bangun alasan logis dari pengamatan bangun ruang" badge="Penalaran" code="A" tone="bg-orange-500">
      <div className="space-y-4">
        <div className="rounded-lg bg-orange-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Pertanyaan terbuka</p>
          <p className="mt-2">Mengapa bagian tubuh Candi Jawi dapat dimodelkan sebagai kubus atau balok?</p>
        </div>
        <Textarea placeholder="Tuliskan alasanmu di sini..." rows={6} value={reasoning} onChange={(event) => setReasoning(event.target.value)} className="rounded-lg" />
        <Button variant="secondary" className="w-full rounded-lg" onClick={handleEvaluate} disabled={loading || !reasoning.trim()}>
          {loading ? 'AI sedang menilai...' : 'Nilai alasan saya'}
        </Button>
        {feedback ? <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{feedback}</div> : null}
        <Button onClick={() => onComplete({ reasoning, rubric: '5-10-10' })} className="w-full rounded-lg bg-emerald-600 py-6 text-base font-semibold hover:bg-emerald-700" disabled={!reasoning.trim()}>
          Lanjut ke penyelesaian
        </Button>
      </div>
    </StageShell>
  );
}
