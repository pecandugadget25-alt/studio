import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StageShell } from './StageShell';
import { Checkbox } from '@/components/ui/checkbox';
import { Lightbulb, Star } from 'lucide-react';

interface IntrospectionStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function IntrospectionStage({ onComplete, onAiAssist }: IntrospectionStageProps) {
  const [confidence, setConfidence] = useState(4);
  const [checklist, setChecklist] = useState<string[]>(['Memahami bangun ruang']);
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const checklistOptions = ['Memahami bangun ruang', 'Membedakan kubus dan balok', 'Menghitung volume kubus', 'Yakin mengerjakan soal serupa'];

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist(`Buat komentar refleksi singkat, positif, dan sederhana. Checklist siswa: ${checklist.join(', ')}. Rating keyakinan: ${confidence}/5. Catatan siswa: ${notes}`);
      setSummary(response);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklist = (item: string) => {
    setChecklist((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  };

  return (
    <StageShell title="Introspection" subtitle="Refleksikan pembelajaran dan nilai tingkat keyakinanmu" badge="Refleksi" code="I" tone="bg-indigo-600" icon={<Lightbulb className="h-5 w-5" />} accentClassName="from-indigo-50 via-white to-slate-50" buttonClassName="bg-indigo-600 hover:bg-indigo-700" progressClassName="bg-indigo-50/70">
      <div className="space-y-4">
        <div className="rounded-lg bg-sky-50 p-4 text-sm text-slate-600">
          <label className="mb-2 block font-semibold text-slate-800">Tingkat kepercayaan diri</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setConfidence(value)} className="rounded-md p-1" aria-label={`Rating ${value}`}>
                <Star className={`h-7 w-7 ${value <= confidence ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em]">Skala: {confidence}/5</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-800">Checklist pemahaman</label>
          <div className="space-y-3">
            {checklistOptions.map((item) => (
              <label key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <Checkbox checked={checklist.includes(item)} onCheckedChange={() => toggleChecklist(item)} />
                {item}
              </label>
            ))}
          </div>
        </div>
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Apa hal baru yang kamu pelajari hari ini?" className="rounded-lg" />
        <Button variant="secondary" className="w-full rounded-lg" onClick={handleSummarize} disabled={loading}>
          {loading ? 'AI sedang membuat rangkuman...' : 'Buat komentar AI'}
        </Button>
        {summary ? <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{summary}</div> : null}
        <Button onClick={() => onComplete({ confidence, checklist, notes, summary })} className="w-full rounded-lg bg-indigo-600 py-6 text-base font-semibold hover:bg-indigo-700">
          Lihat laporan akhir
        </Button>
      </div>
    </StageShell>
  );
}
