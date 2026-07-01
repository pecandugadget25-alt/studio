import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';
import { Box, Cone, Pyramid, Shapes } from 'lucide-react';

interface IdentificationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

const quizOptions = [
  { id: 'kubus', label: 'Kubus', icon: Box, correct: true },
  { id: 'balok', label: 'Balok', icon: Box, correct: true },
  { id: 'prisma', label: 'Prisma', icon: Shapes, correct: true },
  { id: 'limas', label: 'Limas', icon: Pyramid, correct: true },
  { id: 'kerucut', label: 'Kerucut', icon: Cone, correct: false },
];

export function IdentificationStage({ onComplete, onAiAssist }: IdentificationStageProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);

  const correctIds = quizOptions.filter((option) => option.correct).map((option) => option.id);
  const score = selected.filter((id) => correctIds.includes(id)).length * 10;

  const feedback = useMemo(() => {
    if (selected.length === 0) return 'Pilih bangun ruang yang kamu temukan pada gambar dan cerita Candi Jawi.';
    if (correctIds.every((id) => selected.includes(id)) && !selected.includes('kerucut')) return 'Bagus. Kamu menemukan bangun ruang utama yang muncul pada candi.';
    return 'Coba perhatikan badan candi, susunan batu, dan bagian atap. Bentuk mana yang benar-benar tampak?';
  }, [selected]);

  const handleHint = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist('Berikan petunjuk singkat tanpa langsung memberi jawaban: siswa perlu mengidentifikasi kubus, balok, prisma, limas, dan kerucut pada Candi Jawi.');
      setHint(response);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <StageShell title="Identification" subtitle="Identifikasi informasi penting dari gambar dan cerita Candi Jawi" badge="Quiz" code="I" tone="bg-teal-600">
      <div className="space-y-4">
        <div className="rounded-lg bg-teal-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Pertanyaan pengamatan</p>
          <p className="mt-2">Apa saja bangun ruang yang kamu temukan di Candi Jawi? Pilih semua yang sesuai.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {quizOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selected.includes(option.id);
            return (
            <button
              key={option.id}
              onClick={() => toggleSelected(option.id)}
              className={`flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold ${isSelected ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-700'}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {option.label}
            </button>
            );
          })}
        </div>
        <Button variant="secondary" className="w-full rounded-lg" onClick={handleHint} disabled={loading}>
          {loading ? 'AI sedang memberi petunjuk...' : 'Dapatkan petunjuk AI'}
        </Button>
        {hint ? <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{hint}</div> : null}
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
          <p className="font-medium">{feedback}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Skor sementara: {score}</p>
        </div>
        <Button onClick={() => onComplete({ answer: selected, score })} className="w-full rounded-lg bg-teal-600 py-6 text-base font-semibold hover:bg-teal-700" disabled={selected.length === 0}>
          Lanjut ke tahap berikutnya
        </Button>
      </div>
    </StageShell>
  );
}
