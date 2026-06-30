import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StageShell } from './StageShell';

interface IntrospectionStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function IntrospectionStage({ onComplete, onAiAssist }: IntrospectionStageProps) {
  const [confidence, setConfidence] = useState('5');
  const [checklist, setChecklist] = useState('Saya bisa mengenali pola');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist('Buat ringkasan singkat tentang pengalaman belajar siswa dalam tahap introspeksi, dengan nada yang positif dan sederhana.');
      setSummary(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Introspeksi" subtitle="Tandai rasa percaya diri dan refleksi belajar" badge="Refleksi">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] bg-violet-50 p-4 text-sm text-slate-600">
          <label className="mb-2 block font-semibold text-slate-800">Tingkat kepercayaan diri</label>
          <input type="range" min="1" max="5" value={confidence} onChange={(event) => setConfidence(event.target.value)} className="w-full" />
          <p className="mt-2 text-xs uppercase tracking-[0.2em]">Skala: {confidence}/5</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-800">Checklist pemahaman</label>
          <Textarea value={checklist} onChange={(event) => setChecklist(event.target.value)} rows={3} />
        </div>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Tuliskan refleksi singkatmu" />
        <Button variant="secondary" className="w-full rounded-2xl" onClick={handleSummarize} disabled={loading}>
          {loading ? 'AI sedang membuat rangkuman…' : 'Buat ringkasan AI'}
        </Button>
        {summary ? <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">{summary}</div> : null}
        <Button onClick={() => onComplete({ confidence, checklist, notes, summary })} className="w-full rounded-2xl bg-emerald-500 py-6 text-base font-semibold hover:bg-emerald-600">
          Lihat laporan akhir
        </Button>
      </div>
    </StageShell>
  );
}
