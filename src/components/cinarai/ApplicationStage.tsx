import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rocket } from 'lucide-react';

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
      const result = await onAiAssist('Beri bimbingan singkat untuk tantangan aplikasi: siswa perlu mencocokkan bagian atap candi dengan bangun ruang limas. Jangan langsung memberi jawaban jika belum memilih.');
      setFeedback(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Application" subtitle="Terapkan konsep bangun ruang pada bagian candi yang baru" badge="Tantangan" code="A" tone="bg-violet-600" icon={<Rocket className="h-5 w-5" />} accentClassName="from-violet-50 via-white to-slate-50" buttonClassName="bg-violet-600 hover:bg-violet-700" progressClassName="bg-violet-50/70">
      <div className="space-y-4">
        <div className="rounded-lg bg-violet-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Tantangan baru</p>
          <p className="mt-2">Perhatikan bagian atap candi. Bangun ruang apa yang paling sesuai dengan bagian tersebut?</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['Alas', 'Tubuh', 'Atap'].map((part) => (
            <div key={part} className="flex h-20 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700">
              {part}
            </div>
          ))}
        </div>
        <Select value={response} onValueChange={setResponse}>
          <SelectTrigger className="rounded-lg">
            <SelectValue placeholder="Pilih bangun ruang..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kubus">Kubus</SelectItem>
            <SelectItem value="balok">Balok</SelectItem>
            <SelectItem value="limas">Limas</SelectItem>
            <SelectItem value="kerucut">Kerucut</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="secondary" className="w-full rounded-lg" onClick={handleCoach} disabled={loading}>
          {loading ? 'AI sedang membimbing...' : 'Dapatkan bimbingan AI'}
        </Button>
        {feedback ? <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{feedback}</div> : null}
        <Button onClick={() => onComplete({ answer: response, score: response === 'limas' ? 100 : 70 })} className="w-full rounded-lg bg-violet-600 py-6 text-base font-semibold hover:bg-violet-700" disabled={!response}>
          Lanjut refleksi
        </Button>
      </div>
    </StageShell>
  );
}
