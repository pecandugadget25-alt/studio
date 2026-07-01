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
    <div className="mx-auto min-h-screen w-full max-w-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_100%)] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 lg:px-8 xl:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-5 lg:gap-6">
        <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">Belajar hari ini</p>
              <h2 className="text-[clamp(1.6rem,2.6rem,2.2rem)] font-semibold leading-tight tracking-tight text-slate-900">Halo, {firstName}</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
                Lanjutkan perjalanan numerasi budaya dengan fokus yang ringan, rapi, dan mudah diikuti.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Saat ini</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{activeComic.materialName}</p>
                <p className="mt-1 truncate text-sm text-slate-600">{activeComic.title}</p>
              </div>
              <Link href={`/comics/${activeComicId}`} className="w-full sm:w-auto">
                <Button className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-auto">
                  <BookOpen className="h-4 w-4" />
                  Lanjutkan
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href} className="group block">
                <Card className="w-full rounded-[1.25rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-transform duration-200 ease-in-out hover:-translate-y-0.5 sm:p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p>
                </Card>
              </Link>
            );
          })}
        </section>

        <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Aktif saat ini</p>
                  <h3 className="mt-1 text-[clamp(1.2rem,1.8rem,1.5rem)] font-semibold tracking-tight text-slate-900">{activeComic.title}</h3>
                </div>
                <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50 p-2">
                <div className="relative flex items-center justify-center overflow-hidden rounded-[1rem] bg-white p-2">
                  <Image
                    src={activeComic.image}
                    alt={activeComic.title}
                    width={640}
                    height={420}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Progress membaca</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="mt-3 h-2" />
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Halaman saat ini</span>
                  <span>{activeProgress?.currentPage || 1}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={`/comics/${activeComicId}`} className="w-full sm:w-auto">
                  <Button className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                    <BookOpen className="h-4 w-4" />
                    Lanjutkan membaca
                  </Button>
                </Link>
                <Link href={`/comics/${activeComicId}?restart=1`} className="w-full sm:w-auto">
                  <Button variant="outline" className="h-11 w-full rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                    <RotateCcw className="h-4 w-4" />
                    Ulangi
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="rounded-[1.25rem] border border-slate-200/70 bg-white p-4 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Ringkasan</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">Perkembanganmu</h3>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Progress</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{overallProgressPercent}%</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Komik selesai</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{completedComicsCount}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">XP</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{profile?.poin || 0}</p>
                  </div>
                  <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Badge</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{profile?.badges?.length || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[1.25rem] border border-slate-200/70 bg-white p-4 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Aktivitas</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">Terbaru</h3>
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700">
                    <Clock3 className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {recentHistory.length > 0 ? (
                    recentHistory.map((entry) => (
                      <div key={`${entry.comicId}-${entry.updatedAt}`} className="flex gap-3 rounded-[1rem] border border-slate-200 bg-slate-50 p-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                          <BadgeCheck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{entry.completedStages.length}/{CINARAI_STAGES.length} tahap • {entry.xp} XP</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                      Belum ada aktivitas terbaru.
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Rekomendasi</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Komik yang cocok untukmu</h3>
            </div>
            <div className="rounded-2xl bg-slate-100 p-2.5 text-slate-700">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50 p-2">
              <Image
                src={recommendedComic.image}
                alt={recommendedComic.title}
                width={640}
                height={420}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{recommendedComic.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{recommendedComic.description}</p>
              </div>
              <Link href={`/comics/${Object.keys(COMIC_DATA).find((id) => COMIC_DATA[id].title === recommendedComic.title) ?? activeComicId}`} className="mt-4 block">
                <Button className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                  {progressPercent > 0 ? 'Lanjutkan' : 'Mulai membaca'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
