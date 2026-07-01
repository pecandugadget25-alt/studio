import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';
import { Bot, Info, Maximize, RotateCw, Send, ScanLine } from 'lucide-react';

interface NavigationStageProps {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
}

export function NavigationStage({ onComplete, onAiAssist }: NavigationStageProps) {
  const [detected, setDetected] = useState('Kubus');
  const [question, setQuestion] = useState('Apa itu kubus?');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await onAiAssist(`Jelaskan objek AR yang terdeteksi pada Candi Jawi: ${detected}. Jawab pertanyaan siswa: ${question}.`);
      setAiResponse(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StageShell title="Navigation" subtitle="Scan marker komik, jelajahi model 3D, lalu tanya AI" badge="AR + AI" code="N" tone="bg-green-600">
      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-green-100 bg-green-50 p-4">
            <div className="mb-3 flex h-44 items-center justify-center rounded-lg border border-dashed border-green-300 bg-white text-slate-700">
              <div className="text-center">
                <ScanLine className="mx-auto h-8 w-8 text-green-600" />
                <p className="mt-2 text-sm font-semibold">Marker komik terdeteksi</p>
                <p className="text-xs text-slate-500">Model 3D: {detected}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="rounded-lg" type="button" aria-label="Rotasi model">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-lg" type="button" aria-label="Perbesar model">
                <Maximize className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-lg" type="button" aria-label="Info model">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Bot className="h-4 w-4 text-green-600" />
              AI Assistant
            </div>
            <p className="mt-2 text-sm text-slate-600">Tanyakan bangun ruang atau bagian Candi Jawi yang sedang kamu lihat.</p>
            <div className="mt-3 flex gap-2">
              <select value={detected} onChange={(event) => setDetected(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm">
                <option>Kubus</option>
                <option>Balok</option>
                <option>Prisma</option>
                <option>Limas</option>
              </select>
              <Button onClick={handleScan} className="rounded-lg bg-green-600 hover:bg-green-700" disabled={loading} aria-label="Kirim pertanyaan">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" placeholder="Ketik pertanyaanmu..." />
          </div>
        </div>
        {aiResponse ? <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{aiResponse}</div> : null}
        <Button onClick={() => onComplete({ detectedObject: detected, question })} className="w-full rounded-lg bg-emerald-600 py-6 text-base font-semibold hover:bg-emerald-700">
          Lanjut ke penalaran
        </Button>
      </div>
    </StageShell>
  );
}
