import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';

interface CoverStageProps {
  onComplete: () => void;
  coverImage?: string;
  storyIntro?: string;
  learningObjectives?: string[];
  characters?: string[];
}

export function CoverStage({ onComplete, coverImage, storyIntro, learningObjectives, characters }: CoverStageProps) {
  return (
    <StageShell title="Cover Komik" subtitle="Mulai petualangan numerasi lewat komik yang dipandu CINARAI" badge="Mulai">
      <div className="space-y-4">
        {coverImage ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-orange-100">
            <Image src={coverImage} alt="Cover komik" width={800} height={600} className="h-40 w-full object-cover" />
          </div>
        ) : null}
        <div className="rounded-[1.5rem] bg-gradient-to-br from-orange-500 to-amber-400 p-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">Cerita singkat</p>
          <p className="mt-2 text-sm leading-relaxed">{storyIntro || 'Yuk ikuti petualangan belajar dengan langkah yang terurut.'}</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Tujuan belajar</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {(learningObjectives?.length ? learningObjectives : ['Mengamati komik dengan fokus numerasi', 'Menyelesaikan setiap tahap dengan bimbingan AI']).map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Tokoh</p>
          <p className="mt-2">{(characters?.length ? characters : ['Adi']).join(', ')}</p>
        </div>
        <Button onClick={onComplete} className="w-full rounded-2xl bg-orange-500 py-6 text-base font-semibold hover:bg-orange-600">
          Mulai perjalanan CINARAI
        </Button>
      </div>
    </StageShell>
  );
}
