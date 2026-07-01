import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StageShell } from './StageShell';
import { Compass, Volume2 } from 'lucide-react';

interface ContextualizationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

const comicPages = [
  {
    title: 'Kunjungan ke Candi Jawi',
    text: 'Aris melihat badan Candi Jawi yang tersusun dari batu-batu berbentuk kotak. Ia bertanya mengapa bangunan tua itu bisa dipelajari dengan matematika.',
  },
  {
    title: 'Matematika di Candi',
    text: 'Bu Rani menjelaskan bahwa kubus, balok, prisma, limas, dan kerucut dapat ditemukan pada bagian candi jika diamati dengan teliti.',
  },
  {
    title: 'Misi Numerasi',
    text: 'Siswa diminta mengamati gambar candi, memindai marker AR, lalu menyelesaikan tantangan volume bangun ruang.',
  },
];

export function ContextualizationStage({ onComplete, onAiAssist }: ContextualizationStageProps) {
  const [page, setPage] = useState(0);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAi = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist('Jelaskan konteks cerita kunjungan ke Candi Jawi dengan bahasa siswa SD dan hubungkan dengan bangun ruang.');
      setAiResponse(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Contextualization" subtitle="Baca komik Candi Jawi untuk mengaitkan matematika dengan dunia nyata" badge="Komik" code="C" tone="bg-blue-600" icon={<Compass className="h-5 w-5" />} accentClassName="from-blue-50 via-white to-slate-50" buttonClassName="bg-blue-600 hover:bg-blue-700" progressClassName="bg-blue-50/70">
      <div className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
            <span>Halaman {page + 1}</span>
            <span>{Math.round(((page + 1) / comicPages.length) * 100)}%</span>
          </div>
          <Progress value={((page + 1) / comicPages.length) * 100} className="mt-2 h-2 bg-white" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900">{comicPages[page].title}</h4>
          <p className="mt-2 text-sm text-slate-600">{comicPages[page].text}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
            <Volume2 className="h-4 w-4 text-blue-600" />
            Narasi suara siap diputar
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
            Sebelumnya
          </Button>
          <Button className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700" onClick={() => setPage((prev) => Math.min(prev + 1, comicPages.length - 1))}>
            Selanjutnya
          </Button>
        </div>
        <Button variant="secondary" className="w-full rounded-lg" onClick={handleAskAi} disabled={loading}>
          {loading ? 'AI sedang berpikir...' : 'Tanya AI tentang cerita'}
        </Button>
        {aiResponse ? <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{aiResponse}</div> : null}
        <Button onClick={() => onComplete({ page: page + 1, comicCompleted: true })} className="w-full rounded-lg bg-blue-600 py-6 text-base font-semibold hover:bg-blue-700">
          Selesai membaca dan lanjut
        </Button>
      </div>
    </StageShell>
  );
}
