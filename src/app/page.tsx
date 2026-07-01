'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Award, BookOpen, Clock3, Loader2, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
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
    <div className="mx-auto min-h-screen w-full max-w-[min(1600px,100%)] bg-slate-100 px-4 pb-32 pt-20 sm:px-6 lg:px-8 xl:px-12">
      <section className="space-y-6 lg:grid lg:grid-cols-[1.4fr_0.9fr] lg:items-start lg:gap-8">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm lg:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600">CINARAI Smart Learning</p>
              <h2 className="mt-1 text-3xl font-headline font-bold text-slate-900 sm:text-4xl">Halo, {firstName}</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-500 leading-relaxed sm:text-base">
                Lanjutkan perjalanan Critical Numeracy with AR & AI dari tahap yang belum selesai.
              </p>
            </div>
            <div className="hidden rounded-3xl bg-blue-50 p-4 text-blue-600 lg:block">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl bg-blue-700 p-6 text-white shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/75">Modul aktif</p>
              <h3 className="mt-4 text-2xl font-headline font-bold">{activeComic.moduleName}</h3>
              <p className="mt-3 text-sm text-white/80 leading-relaxed">{activeComic.title}</p>

              <div className="mt-6 rounded-3xl bg-white/10 p-5 backdrop-blur">
                <div className="flex items-center justify-between text-sm font-semibold text-white/90">
                  <span>Tahap saat ini</span>
                  <span>{currentStage?.title}</span>
                </div>
                <p className="mt-3 text-sm text-white/80">Tujuan belajar: {activeComic.learningObjectives[0]}</p>
                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    <span>Progres belajar</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-3 bg-white/20" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Link href={`/comics/${activeComicId}`} className="block">
                <Button className="h-14 w-full rounded-xl bg-white font-semibold text-primary hover:bg-white/90 shadow-sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Mulai Petualangan
                </Button>
              </Link>
              <Link href={`/comics/${activeComicId}?restart=1`} className="block">
                <Button variant="outline" className="h-14 w-full rounded-xl border-white/50 bg-transparent font-semibold text-slate-800 hover:bg-slate-50 shadow-sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Ulangi Alur
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Statistik cepat</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Ringkasan progres</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-none">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Poin</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{profile?.poin || 0}</p>
              </Card>
              <Card className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-none">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Badge</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{profile?.badges?.length || 0}</p>
              </Card>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-headline font-bold text-slate-900">Riwayat belajar</h3>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Auto-synced</span>
            </div>
            <div className="mt-5 space-y-3">
              {recentHistory.length > 0 ? (
                recentHistory.map((entry) => (
                  <Card key={`${entry.comicId}-${entry.updatedAt}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-none">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{entry.completedStages.length}/{CINARAI_STAGES.length} tahap selesai - {entry.xp} XP</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <Clock3 className="h-4 w-4" />
                        <span>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Belum ada riwayat belajar. Mulai dari Cover untuk memulai perjalanan CINARAI.
                </Card>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
