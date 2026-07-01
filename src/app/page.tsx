'use client';

import { useEffect } from 'react';
import { ArrowRight, Loader2, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="space-y-2 px-1 sm:px-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">Learning Journey</p>
          <h1 className="text-[clamp(1.7rem,3rem,2.4rem)] font-semibold leading-tight tracking-tight text-slate-900">Halo, {firstName}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">Ikuti satu perjalanan belajar yang menghubungkan komik, sintaks CINARAI, dan pemahaman numerasi.</p>
        </div>

        <Card className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/95 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="space-y-5 p-4 sm:p-6 lg:p-7">
            <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-[16/9]">
                <img src={activeComic.image} alt={activeComic.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Komik saat ini
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{activeComic.title}</h3>
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Komik yang sedang dipelajari</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{activeComic.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{activeComic.storyIntro}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Aktif
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      Lokasi
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{activeComic.materialName}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Sintaks saat ini
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{currentStage.title}</p>
                  </div>
                </div>

                <div className="space-y-2 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Progress belajar</span>
                    <span className="text-primary">{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2.5" />
                </div>

                <Link href={`/comics/${activeComicId}`} className="block">
                  <Button className="h-12 w-full rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary/90">
                    LANJUTKAN BELAJAR
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Progress saat ini</p>
                  <p className="text-base font-semibold text-slate-900">{currentStage.title}</p>
                </div>
                <div className="text-sm font-semibold text-primary">{progressPercent}%</div>
              </div>
              <CinaraiProgress completedStages={completedStages} currentStageId={currentStageId} />
            </div>

            <Link href={`/comics/${activeComicId}`} className="block">
              <Button className="h-12 w-full rounded-2xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:bg-primary/90">
                LANJUTKAN
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
