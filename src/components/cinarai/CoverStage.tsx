import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { StageShell } from './StageShell';
import { BookOpen, ClipboardCheck, UserRound } from 'lucide-react';

interface CoverStageProps {
  onComplete: () => void;
  coverImage?: string;
  storyIntro?: string;
  learningObjectives?: string[];
  characters?: string[];
}

export function CoverStage({ onComplete, coverImage, storyIntro, learningObjectives, characters }: CoverStageProps) {
  return (
    <StageShell title="Cover Komik" subtitle="Mulai petualangan numerasi lewat komik AR etnomatematika Candi Jawi" badge="Mulai" code="1" tone="bg-slate-700">
      <div className="space-y-4">
        {coverImage ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <Image src={coverImage} alt="Cover komik" width={800} height={600} className="h-40 w-full object-cover" />
          </div>
        ) : null}
        <div className="rounded-lg bg-blue-600 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em]">Bangun Ruang Candi Jawi</p>
          <p className="mt-2 text-sm leading-relaxed">{storyIntro || 'Aris dan teman-temannya mengunjungi Candi Jawi dan menemukan banyak bangun ruang pada bagian candi.'}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
            Tujuan belajar
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {(learningObjectives?.length ? learningObjectives : ['Mengamati bangun ruang pada Candi Jawi', 'Menjelaskan alasan matematika dari bentuk candi', 'Menghitung volume kubus dan balok sederhana']).map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <UserRound className="h-4 w-4 text-teal-600" />
              Profil tokoh
            </div>
            <p className="mt-2">{(characters?.length ? characters : ['Aris', 'Bu Rani', 'Naya']).join(', ')}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <BookOpen className="h-4 w-4 text-orange-500" />
              Pretest
            </div>
            <p className="mt-2">Disiapkan sebelum tahap Contextualization.</p>
          </div>
        </div>
        <Button onClick={onComplete} className="w-full rounded-lg bg-blue-600 py-6 text-base font-semibold hover:bg-blue-700">
          Mulai petualangan
        </Button>
      </div>
    </StageShell>
  );
}
