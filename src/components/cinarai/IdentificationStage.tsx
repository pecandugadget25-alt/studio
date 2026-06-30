import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';

interface IdentificationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

const quizOptions = [
  { id: 'triangle', label: 'Segitiga' },
  { id: 'circle', label: 'Lingkaran' },
  { id: 'hexagon', label: 'Heksagon' },
];

export function IdentificationStage({ onComplete, onAiAssist }: IdentificationStageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);

  const feedback = useMemo(() => {
    if (!selected) return 'Pilih bentuk yang paling cocok dengan pola batik yang kamu lihat.';
    if (selected === 'triangle') return 'Hebat! Bentuk segitiga cocok dengan pola batik.';
    return 'Coba pikirkan kembali bentuk yang paling sering muncul pada motif.';
  }, [selected]);

  const handleHint = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist('Berikan petunjuk singkat tanpa langsung memberi jawaban untuk mengidentifikasi bentuk pola batik.');
      setHint(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Identifikasi" subtitle="Pilih bentuk yang muncul pada pola" badge="Quiz">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] bg-sky-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Pola yang terlihat</p>
          <p className="mt-2">Motif batik ini terdiri dari bentuk yang memiliki tiga sisi dan tiga sudut.</p>
        </div>
        <div className="grid gap-2">
          {quizOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${selected === option.id ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-slate-200 bg-white text-slate-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <Button variant="secondary" className="w-full rounded-2xl" onClick={handleHint} disabled={loading}>
          {loading ? 'AI sedang memberi petunjuk…' : 'Dapatkan petunjuk AI'}
        </Button>
        {hint ? <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">{hint}</div> : null}
        <p className="text-sm font-medium text-slate-600">{feedback}</p>
        <Button onClick={() => onComplete({ answer: selected })} className="w-full rounded-2xl bg-sky-500 py-6 text-base font-semibold hover:bg-sky-600" disabled={!selected}>
          Lanjut ke tahap berikutnya
        </Button>
      </div>
    </StageShell>
  );
}
