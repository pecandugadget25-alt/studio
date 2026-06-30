import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StageShell } from './StageShell';

interface ResolutionStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function ResolutionStage({ onComplete, onAiAssist }: ResolutionStageProps) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist(`Bantu siswa memecahkan masalah numerasi berikut langkah demi langkah. Soal: Ada 4 pola batik, setiap pola memiliki 3 segitiga. Berapa total segitiga? Jika jawaban siswa adalah ${answer}, jelaskan kesalahan atau kebenarannya secara bertahap.`);
      setFeedback(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Resolusi" subtitle="Selesaikan soal numerasi dengan penjelasan bertahap" badge="Soal">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] bg-amber-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Masalah</p>
          <p className="mt-2">Ada 4 pola batik, setiap pola memiliki 3 segitiga. Berapa total segitiga?</p>
        </div>
        <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Tulis jawabanmu" />
        <Button variant="secondary" className="w-full rounded-2xl" onClick={handleCheck} disabled={loading || !answer.trim()}>
          {loading ? 'AI sedang menjelaskan…' : 'Lihat penjelasan AI'}
        </Button>
        {feedback ? <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">{feedback}</div> : null}
        <Button onClick={() => onComplete({ answer })} className="w-full rounded-2xl bg-emerald-500 py-6 text-base font-semibold hover:bg-emerald-600">
          Lanjut ke aplikasi
        </Button>
      </div>
    </StageShell>
  );
}
