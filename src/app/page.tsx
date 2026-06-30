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
    <div className="min-h-screen bg-slate-50/50 px-4 pb-32 pt-20">
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">CINARAI Dashboard</p>
            <h2 className="mt-1 text-2xl font-headline font-bold text-slate-900">Halo, {firstName}! 👋</h2>
            <p className="mt-1 text-sm text-slate-500">Belajar dimulai dari tahap yang belum selesai, tanpa harus mencari komik lagi.</p>
          </div>
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <Card className="rounded-[2rem] border-none bg-gradient-to-br from-primary to-blue-700 p-5 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Modul aktif</p>
              <h3 className="mt-2 text-xl font-headline font-bold">{activeComic.moduleName}</h3>
              <p className="mt-2 text-sm text-white/80">{activeComic.title}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Tahap saat ini</span>
              <span>{currentStage?.title}</span>
            </div>
            <p className="mt-2 text-sm text-white/80">Tujuan belajar: {activeComic.learningObjectives[0]}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                <span>Progres belajar</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-white/20" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href={`/comics/${activeComicId}`} className="block">
              <Button className="h-12 w-full rounded-2xl bg-white font-semibold text-primary hover:bg-white/90">
                <BookOpen className="mr-2 h-4 w-4" />
                Continue Learning
              </Button>
            </Link>
            <Link href={`/comics/${activeComicId}?restart=1`} className="block">
              <Button variant="outline" className="h-12 w-full rounded-2xl border-white/50 bg-transparent font-semibold text-white hover:bg-white/10">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart Learning
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Card className="rounded-[1.5rem] border-none bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">XP</p>
          <div className="mt-2 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-xl font-bold text-slate-900">{profile?.poin || 0}</span>
          </div>
        </Card>
        <Card className="rounded-[1.5rem] border-none bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Badges</p>
          <div className="mt-2 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-500" />
            <span className="text-xl font-bold text-slate-900">{profile?.badges?.length || 0}</span>
          </div>
        </Card>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-headline font-bold text-slate-900">Riwayat belajar terkini</h3>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Auto-synced</span>
        </div>
        <div className="space-y-3">
          {recentHistory.length > 0 ? (
            recentHistory.map((entry) => (
              <Card key={`${entry.comicId}-${entry.updatedAt}`} className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{entry.completedStages.length}/{CINARAI_STAGES.length} tahap selesai • {entry.xp} XP</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    <span>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
              Belum ada riwayat belajar. Mulai dari Cover untuk memulai perjalanan CINARAI.
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}