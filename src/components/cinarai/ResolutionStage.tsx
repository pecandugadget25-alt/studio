import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StageShell } from './StageShell';
import { CheckCircle2 } from 'lucide-react';

interface ResolutionStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function ResolutionStage({ onComplete, onAiAssist }: ResolutionStageProps) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const isCorrect = Number(answer) === 512;

  const handleCheck = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist(`Bantu siswa memecahkan soal volume kubus secara bertahap. Soal: Jika rusuk kubus pada bagian alas Candi Jawi berukuran 8 cm, berapakah volumenya? Jawaban siswa: ${answer}. Gunakan rumus V = s x s x s.`);
      setFeedback(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Resolution" subtitle="Selesaikan tantangan numerasi untuk menemukan jawaban terbaik" badge="Soal" code="R" tone="bg-red-500">
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Misi Kubus</p>
          <p className="mt-2">Jika rusuk kubus pada bagian alas Candi Jawi berukuran 8 cm, berapakah volumenya?</p>
          <p className="mt-2 rounded-md bg-white px-3 py-2 font-semibold text-slate-800">V = s x s x s</p>
        </div>
        <Input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Tulis jawabanmu dalam cm3" className="rounded-lg" inputMode="numeric" />
        {answer ? (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm font-semibold ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <CheckCircle2 className="h-4 w-4" />
            {isCorrect ? 'Benar, 8 x 8 x 8 = 512 cm3.' : 'Cek kembali perkalian rusuknya.'}
          </div>
        ) : null}
        <Button variant="secondary" className="w-full rounded-lg" onClick={handleCheck} disabled={loading || !answer.trim()}>
          {loading ? 'AI sedang menjelaskan...' : 'Lihat penjelasan AI'}
        </Button>
        {feedback ? <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{feedback}</div> : null}
        <Button onClick={() => onComplete({ answer, score: isCorrect ? 100 : 60 })} className="w-full rounded-lg bg-emerald-600 py-6 text-base font-semibold hover:bg-emerald-700" disabled={!answer.trim()}>
          Lanjut ke aplikasi
        </Button>
      </div>
    </StageShell>
  );
}
