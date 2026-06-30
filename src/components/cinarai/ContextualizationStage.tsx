import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StageShell } from './StageShell';

interface ContextualizationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

const comicPages = [
  {
    title: 'Sang Penjelajah Batik',
    text: 'Lina melihat motif batik berbentuk segitiga yang berulang di kain. Ia penasaran berapa banyak pola sama yang muncul.',
  },
  {
    title: 'Pola yang Menarik',
    text: 'Lina menghitung bahwa setiap motif terbuat dari dua segitiga yang saling berpasangan. Ia mulai melihat kesimetrian.',
  },
  {
    title: 'Kunci Numerasi',
    text: 'Saat ia mengamati pola, Lina menyadari bahwa matematika ada di setiap bentuk yang ia lihat di rumah dan sekolah.',
  },
];

export function ContextualizationStage({ onComplete, onAiAssist }: ContextualizationStageProps) {
  const [page, setPage] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAi = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist(`Jelaskan cerita komik ini dengan bahasa sederhana dan fokus pada alur cerita.`);
      setAiResponse(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Kontekstualisasi" subtitle="Baca komik, lalu ajak AI membahas ceritanya" badge="Cerita">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] bg-orange-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">
            <span>Halaman {page + 1}</span>
            <span>{Math.round(((page + 1) / comicPages.length) * 100)}%</span>
          </div>
          <Progress value={((page + 1) / comicPages.length) * 100} className="mt-2 h-2 bg-white" />
        </div>
        <div className="rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900">{comicPages[page].title}</h4>
          <p className="mt-2 text-sm text-slate-600">{comicPages[page].text}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
            Sebelumnya
          </Button>
          <Button className="flex-1 rounded-2xl bg-orange-500 hover:bg-orange-600" onClick={() => setPage((prev) => Math.min(prev + 1, comicPages.length - 1))}>
            Selanjutnya
          </Button>
        </div>
        <Button variant="secondary" className="w-full rounded-2xl" onClick={handleAskAi} disabled={loading}>
          {loading ? 'AI sedang berpikir…' : 'Tanya AI tentang cerita'}
        </Button>
        {aiResponse ? <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">{aiResponse}</div> : null}
        <Button onClick={() => onComplete({ page: page + 1 })} className="w-full rounded-2xl bg-emerald-500 py-6 text-base font-semibold hover:bg-emerald-600">
          Selesai membaca dan lanjut
        </Button>
      </div>
    </StageShell>
  );
}
