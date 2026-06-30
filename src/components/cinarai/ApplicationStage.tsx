import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StageShell } from './StageShell';

interface ApplicationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function ApplicationStage({ onComplete, onAiAssist }: ApplicationStageProps) {
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCoach = async () => {
    setLoading(true);
    try {
      const result = await onAiAssist('Beri bimbingan singkat untuk situasi dunia nyata: menghitung banyak motif pada kain batik yang dipakai di acara pasar. Jangan langsung memberi jawaban, ajak siswa berpikir terlebih dahulu.');
      setFeedback(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Aplikasi" subtitle="Terapkan konsep pada situasi nyata" badge="Konteks">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] bg-emerald-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Situasi</p>
          <p className="mt-2">Di pasar, ada 5 lembar kain batik. Setiap kain memiliki 2 motif besar. Bagaimana kamu bisa menghitung total motif?</p>
        </div>
        <Textarea value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Coba jelaskan langkahmu" rows={4} />
        <Button variant="secondary" className="w-full rounded-2xl" onClick={handleCoach} disabled={loading}>
          {loading ? 'AI sedang membimbing…' : 'Dapatkan bimbingan AI'}
        </Button>
        {feedback ? <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">{feedback}</div> : null}
        <Button onClick={() => onComplete({ reflection: response })} className="w-full rounded-2xl bg-emerald-500 py-6 text-base font-semibold hover:bg-emerald-600">
          Lanjut refleksi
        </Button>
      </div>
    </StageShell>
  );
}
