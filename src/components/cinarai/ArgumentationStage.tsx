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
      const response = await onAiAssist(`Nilai alasan berikut dengan kriteria: akurasi konsep, kelengkapan, kosakata matematika, dan penjelasan logis. Berikan skor 1-5 untuk setiap kriteria dan saran singkat. Alasan: ${reasoning}`);
      setFeedback(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Argumentasi" subtitle="Tulis alasanmu dan dapatkan evaluasi AI" badge="Penalaran">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Jelaskan mengapa bentuk segitiga cocok untuk pola tersebut. Gunakan istilah matematika seperti sisi, sudut, dan simetri.</p>
        <Textarea placeholder="Tuliskan alasanmu di sini..." rows={6} value={reasoning} onChange={(event) => setReasoning(event.target.value)} />
        <Button variant="secondary" className="w-full rounded-2xl" onClick={handleEvaluate} disabled={loading || !reasoning.trim()}>
          {loading ? 'AI sedang menilai…' : 'Nilai alasan saya'}
        </Button>
        {feedback ? <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">{feedback}</div> : null}
        <Button onClick={() => onComplete({ reasoning })} className="w-full rounded-2xl bg-emerald-500 py-6 text-base font-semibold hover:bg-emerald-600">
          Lanjut ke penyelesaian
        </Button>
      </div>
    </StageShell>
  );
}
