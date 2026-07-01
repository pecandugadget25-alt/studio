'use client';

import { useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CinaraiProgress } from '@/components/CinaraiProgress';
import { CINARAI_STAGES, type CinaraiSessionData, type CinaraiStageId } from '@/components/cinarai/types';
import { getNextStageId } from '@/components/cinarai/progression';
import { COMIC_DATA } from '@/components/comics/CinaraiComicLearning';

const DEFAULT_COMIC_ID = 'komik-1';

export default function MobileDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile && profile.peran !== 'siswa') {
        router.push('/teacher');
      }
    }
  }, [user, profile, authLoading, router]);

  const firstName = profile?.nama ? profile.nama.split(' ')[0] : 'Siswa';
  const activeComicId = Object.keys(profile?.comicProgress ?? {}).filter((comicId) => comicId in COMIC_DATA)[0] ?? DEFAULT_COMIC_ID;
  const activeComic = COMIC_DATA[activeComicId] ?? COMIC_DATA[DEFAULT_COMIC_ID];
  const activeProgress = (profile?.comicProgress?.[activeComicId] as Partial<CinaraiSessionData> | undefined) ?? null;
  const completedStages = (activeProgress?.completedStages ?? []) as CinaraiStageId[];
  const currentStageId = getNextStageId(completedStages);
  const currentStage = CINARAI_STAGES.find((stage) => stage.id === currentStageId) ?? CINARAI_STAGES[0];
  const progressPercent = completedStages.length === 0 ? 0 : Math.round((completedStages.length / CINARAI_STAGES.length) * 100);
  const readingProgressPercent = progressPercent;
  const overallProgressPercent = Math.round((Math.max(1, completedStages.length) / CINARAI_STAGES.length) * 100);
  const completedComicsCount = profile?.completedComics?.length || Object.values(profile?.comicProgress ?? {}).filter((value) => Boolean(value && typeof value === 'object' && (value as Partial<CinaraiSessionData>).completedStages?.length)).length;
  const remainingPages = Math.max(1, Math.max(1, (activeProgress?.totalPages || 1) - (activeProgress?.currentPage || 0)));
  const recentHistory = Object.entries(profile?.comicProgress ?? {})
    .filter(([, value]) => value && typeof value === 'object')
    .map(([comicId, value]) => {
      const session = value as Partial<CinaraiSessionData>;
      return {
        comicId,
        title: COMIC_DATA[comicId]?.title ?? 'Komik EthnoArith',
        updatedAt: session.updatedAt ?? '',
        completedStages: session.completedStages ?? [],
        xp: session.xp ?? 0,
      };
    })
    .filter((entry) => entry.completedStages.length > 0)
    .sort((left, right) => (right.updatedAt || '').localeCompare(left.updatedAt || ''))
    .slice(0, 4);

  const shouldShowLoader = authLoading || (Boolean(user) && !profile);
  const shouldRenderStudentDashboard = Boolean(user && profile && profile.peran === 'siswa');

  if (shouldShowLoader) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!shouldRenderStudentDashboard) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200/70 bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-7">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">Learning Journey</p>
            <h1 className="text-[clamp(1.7rem,3rem,2.4rem)] font-semibold leading-tight tracking-tight text-slate-900">Halo, {firstName}</h1>
          </div>

          <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Modul aktif</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{activeComic.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{activeComic.materialName}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Progress</p>
              <p className="text-sm font-semibold text-primary">{progressPercent}%</p>
            </div>
            <CinaraiProgress completedStages={completedStages} currentStageId={currentStageId} />
          </div>

          <Link href={`/comics/${activeComicId}`} className="block">
            <Button className="h-12 w-full rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
              LANJUTKAN
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
