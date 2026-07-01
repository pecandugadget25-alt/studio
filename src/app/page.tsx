'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Clock3,
  Compass,
  Crown,
  Flame,
  Loader2,
  QrCode,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
} from 'lucide-react';
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

  const quickActions = [
    { label: 'Lanjutkan', icon: BookOpen, href: `/comics/${activeComicId}`, description: 'Kembali ke bacaan aktif' },
    { label: 'Komik', icon: Compass, href: '/komik', description: 'Jelajahi koleksi' },
    { label: 'Peringkat', icon: Trophy, href: '/leaderboard', description: 'Lihat pencapaian' },
    { label: 'Scan QR', icon: QrCode, href: '/scan', description: 'Buka tantangan' },
    { label: 'Aktivitas', icon: Activity, href: '/profile', description: 'Pantau progress' },
  ];

  const recommendedComic = Object.values(COMIC_DATA).find((comic) => comic.title !== activeComic.title) ?? activeComic;

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
    <div className="mx-auto min-h-screen w-full max-w-[1400px] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_100%)] px-4 pb-32 pt-20 sm:px-6 lg:px-8 xl:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-4 shadow-[0_16px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">Selamat datang kembali</p>
              <h2 className="mt-2 text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-slate-900">Halo, {firstName}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Teruskan petualangan numerasi budaya dengan fokus yang tenang, jelas, dan penuh progres.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href={`/comics/${activeComicId}`} className="w-full sm:w-auto">
                  <Button className="h-12 w-full rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-auto">
                    <BookOpen className="h-4 w-4" />
                    Lanjutkan belajar
                  </Button>
                </Link>
                <Link href={`/comics/${activeComicId}?restart=1`} className="w-full sm:w-auto">
                  <Button variant="outline" className="h-12 w-full rounded-2xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto">
                    <RotateCcw className="h-4 w-4" />
                    Ulangi alur
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-primary/10 bg-primary/5 p-4 text-primary lg:min-w-[260px] lg:max-w-[280px]">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                Materi aktif
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-900">{activeComic.materialName}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{activeComic.title}</p>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  <span>Tahap sekarang</span>
                  <span>{currentStage?.title}</span>
                </div>
                <Progress value={progressPercent} className="mt-2 h-2" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href} className="group block">
                <Card className="rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{action.description}</p>
                </Card>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Learning progress</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Ringkasan belajar</h3>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Target className="h-4 w-4 text-primary" />
                    Overall Progress
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{overallProgressPercent}%</p>
                </div>
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Completed Comics
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{completedComicsCount}</p>
                </div>
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Reading Progress
                  </div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{readingProgressPercent}%</p>
                </div>
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Crown className="h-4 w-4 text-amber-500" />
                    XP & Badge
                  </div>
                  <p className="mt-3 text-lg font-semibold text-slate-900">{profile?.poin || 0} XP • {profile?.badges?.length || 0} badge</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-[0_16px_48px_rgba(15,23,42,0.05)]">
              <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[220px] bg-slate-100 sm:min-h-[260px]">
                  <Image src={activeComic.image} alt={activeComic.title} fill className="object-cover" priority />
                </div>
                <div className="flex flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Active comic
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{activeComic.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{activeComic.description}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Current Page</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{activeProgress?.currentPage || 1}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Progress</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{readingProgressPercent}%</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>Reading status</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="mt-3 h-2" />
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>Estimasi sisa halaman</span>
                      <span>{remainingPages} halaman</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link href={`/comics/${activeComicId}`} className="w-full sm:w-auto">
                      <Button className="h-12 w-full rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-auto">
                        <BookOpen className="h-4 w-4" />
                        Continue Reading
                      </Button>
                    </Link>
                    <Link href={`/comics/${activeComicId}?restart=1`} className="w-full sm:w-auto">
                      <Button variant="outline" className="h-12 w-full rounded-2xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto">
                        <RotateCcw className="h-4 w-4" />
                        Restart
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Recent activity</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Aktivitas terbaru</h3>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Clock3 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {recentHistory.length > 0 ? (
                  recentHistory.map((entry) => (
                    <div key={`${entry.comicId}-${entry.updatedAt}`} className="flex gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{entry.completedStages.length}/{CINARAI_STAGES.length} tahap selesai • {entry.xp} XP</p>
                      </div>
                      <div className="text-right text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {entry.updatedAt ? new Date(entry.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Belum ada aktivitas terbaru. Mulai petualanganmu hari ini.
                  </div>
                )}
              </div>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Recommendation</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Rekomendasi untukmu</h3>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                <div className="relative aspect-[4/3] w-full">
                  <Image src={recommendedComic.image} alt={recommendedComic.title} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-900">{recommendedComic.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{recommendedComic.description}</p>
                  <Link href={`/comics/${Object.keys(COMIC_DATA).find((id) => COMIC_DATA[id].title === recommendedComic.title) ?? activeComicId}`} className="mt-4 block">
                    <Button className="h-12 w-full rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                      {progressPercent > 0 ? 'Continue' : 'Start Reading'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
