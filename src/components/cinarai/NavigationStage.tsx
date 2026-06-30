import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';

interface NavigationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function NavigationStage({ onComplete, onAiAssist }: NavigationStageProps) {
  const [detected, setDetected] = useState('Segitiga');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist(`Jelaskan objek yang saat ini terdeteksi oleh kamera AR: ${detected}. Fokus hanya pada objek yang sedang terdeteksi.`);
      setAiResponse(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Navigasi AR" subtitle="Lihat objek 3D dan dengarkan penjelasan AI" badge="AR + AI">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4">
          <div className="mb-3 flex h-32 items-center justify-center rounded-[1.25rem] bg-white/70 text-4xl font-bold text-slate-700">
            3D
          </div>
          <p className="text-sm text-slate-600">Kamera AR mendeteksi objek berbentuk <span className="font-semibold text-purple-700">{detected}</span>.</p>
        </div>
        <Button onClick={handleScan} className="w-full rounded-2xl bg-purple-500 py-6 text-base font-semibold hover:bg-purple-600" disabled={loading}>
          {loading ? 'AI sedang mengamati…' : 'Deteksi objek saat ini'}
        </Button>
        {aiResponse ? <div className="rounded-[1.25rem] bg-slate-50 p-3 text-sm text-slate-600">{aiResponse}</div> : null}
        <Button onClick={() => onComplete({ detectedObject: detected })} className="w-full rounded-2xl bg-emerald-500 py-6 text-base font-semibold hover:bg-emerald-600">
          Lanjut ke penalaran
        </Button>
      </div>
    </StageShell>
  );
}
