'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Bot, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NavigationObject } from '@/components/ar/NavigationArCamera';

type NavigationAiAssistantProps = {
  object: NavigationObject;
  onAiAssist: (prompt: string) => Promise<string>;
  onInteraction?: () => void;
};

const politeRejection = 'Maaf, saya hanya dapat membantu tentang komik saat ini, objek AR yang terdeteksi, dan topik matematika yang sedang dipelajari.';

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

export function NavigationAiAssistant({ object, onAiAssist, onInteraction }: NavigationAiAssistantProps) {
  const [question, setQuestion] = useState('Apa hubungan objek ini dengan volume?');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const allowedTerms = useMemo(() => {
    const baseTerms = [
      object.name,
      object.topic,
      object.comic,
      object.marker,
      'volume',
      'luas',
      'bangun ruang',
      'kubus',
      'balok',
      'prisma',
      'limas',
      'candi',
      'marker',
      'komik',
      'objek',
      'matematika',
      'numerasi',
    ];

    return baseTerms.flatMap((term) => normalizeText(term).split(/\s+/)).filter((term) => term.length > 2);
  }, [object]);

  const isInScope = (value: string) => {
    const normalized = normalizeText(value);
    return allowedTerms.some((term) => normalized.includes(term));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    if (!isInScope(trimmedQuestion)) {
      setAnswer(politeRejection);
      return;
    }

    setLoading(true);
    try {
      const scopedPrompt = [
        'Tahap aktif: Navigation.',
        `Komik saat ini: ${object.comic}.`,
        `Objek AR saat ini: ${object.name}.`,
        `Topik matematika saat ini: ${object.topic}.`,
        'Jawab hanya jika pertanyaan berkaitan dengan komik saat ini, objek AR saat ini, atau topik matematika saat ini.',
        `Jika tidak berkaitan, jawab persis: "${politeRejection}"`,
        `Pertanyaan siswa: ${trimmedQuestion}`,
      ].join(' ');
      const response = await onAiAssist(scopedPrompt);
      setAnswer(response);
      onInteraction?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-950">AI Assistant</h3>
            <p className="text-xs text-slate-500">Focused on this comic, object, and math topic.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
          Scan marker komik, amati <strong>{object.name}</strong>, lalu tanyakan konsep <strong>{object.topic}</strong>.
        </div>
        <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Saya hanya menjawab tentang komik ini, objek yang muncul, dan topik matematika yang sedang aktif.</p>
        </div>
        {answer ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm">
            {answer}
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="h-12 min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            placeholder="Ask about this AR object..."
          />
          <Button type="submit" className="h-12 rounded-2xl bg-blue-600 px-4 hover:bg-blue-700" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}
