'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { arrayUnion, doc, increment, updateDoc, type DocumentData, type UpdateData } from 'firebase/firestore';
import { cinaraiStageGuidance } from '@/ai/flows/cinarai-stage-guidance';
import { CoverStage } from '@/components/cinarai/CoverStage';
import { ContextualizationStage } from '@/components/cinarai/ContextualizationStage';
import { IdentificationStage } from '@/components/cinarai/IdentificationStage';
import { NavigationStage } from '@/components/cinarai/NavigationStage';
import { ArgumentationStage } from '@/components/cinarai/ArgumentationStage';
import { ResolutionStage } from '@/components/cinarai/ResolutionStage';
import { ApplicationStage } from '@/components/cinarai/ApplicationStage';
import { IntrospectionStage } from '@/components/cinarai/IntrospectionStage';
import { ReportStage } from '@/components/cinarai/ReportStage';
import { CinaraiStageProgress } from '@/components/cinarai/CinaraiStageProgress';
import { calculateMasteryPercentage, calculateSessionXp, getNextStageId } from '@/components/cinarai/progression';
import { CINARAI_STAGES, CinaraiSessionData, CinaraiStageId, CinaraiStagePayload } from '@/components/cinarai/types';
import { cn } from '@/lib/utils';

const PdfComicReader = dynamic(
  () => import('@/components/comics/PdfComicReader').then((mod) => mod.PdfComicReader),
  {
    ssr: false,
    loading: () => <div className="p-6 text-center">Loading comic...</div>,
  }
);

interface CinaraiComicLearningProps {
  comicId: string;
}

export const COMIC_DATA: Record<string, {
  title: string;
  description: string;
  comicFolder: string;
  image: string;
  materialName: string;
  color: string;
  learningObjectives: string[];
  characters: string[];
  storyIntro: string;
}> = {
  'komik-1': {
    title: 'Bangun Ruang Candi Jawi',
    description: 'Eksplorasi bangun ruang melalui aset komik Candi Jawi.',
    comicFolder: 'candi-jawi',
    image: '/comics/candi-jawi/cover.webp',
    materialName: 'Candi Jawi',
    color: 'bg-blue-600',
    learningObjectives: ['Mengidentifikasi bangun ruang pada arsitektur Candi Jawi', 'Menjelaskan alasan matematika dari bentuk candi', 'Menghitung volume kubus sederhana dari konteks candi'],
    characters: ['Aris', 'Naya', 'Bu Rani'],
    storyIntro: 'Aris dan Naya berkunjung ke Candi Jawi. Bu Rani mengajak mereka melihat bahwa bagian candi dapat dipelajari melalui bangun ruang.',
  },
  'komik-2': {
    title: 'Bangun Ruang Candi Penataran',
    description: 'Eksplorasi bangun ruang melalui aset komik Candi Penataran.',
    comicFolder: 'candi-penataran',
    image: '/comics/candi-penataran/cover.webp',
    materialName: 'Candi Penataran',
    color: 'bg-primary',
    learningObjectives: ['Mengidentifikasi bangun ruang pada arsitektur Candi Penataran', 'Menghubungkan ukuran dengan pola susunan', 'Menjelaskan pemecahan masalah numerasi'],
    characters: ['Aris', 'Naya', 'Bu Rani'],
    storyIntro: 'Aris dan Naya mengamati Candi Penataran untuk menemukan bentuk bangun ruang pada bagian bangunannya.',
  },
  'komik-3': {
    title: 'Bangun Ruang Gajah Mungkur',
    description: 'Eksplorasi bangun ruang melalui aset komik Gajah Mungkur.',
    comicFolder: 'gajah-mungkur',
    image: '/comics/gajah-mungkur/cover.webp',
    materialName: 'Gajah Mungkur',
    color: 'bg-red-500',
    learningObjectives: ['Mengidentifikasi bangun ruang pada Gajah Mungkur', 'Membedakan bentuk dan ukuran', 'Menyusun alasan dari hasil pengamatan'],
    characters: ['Aris', 'Naya', 'Bu Rani'],
    storyIntro: 'Aris dan Naya mengamati Gajah Mungkur dan mencatat bentuk-bentuk ruang yang muncul pada bangunannya.',
  },
  'komik-4': {
    title: 'Bangun Ruang Jembatan Merah',
    description: 'Eksplorasi bangun ruang melalui aset komik Jembatan Merah.',
    comicFolder: 'jembatan-merah',
    image: '/comics/jembatan-merah/cover.webp',
    materialName: 'Jembatan Merah',
    color: 'bg-green-500',
    learningObjectives: ['Mengidentifikasi bangun ruang pada Jembatan Merah', 'Menghubungkan geometri dengan arsitektur', 'Membuat kesimpulan dari pengamatan'],
    characters: ['Aris', 'Naya', 'Bu Rani'],
    storyIntro: 'Aris dan Naya mengamati Jembatan Merah dan menemukan bentuk ruang dari susunan bangunannya.',
  },
  'komik-5': {
    title: 'Bangun Ruang Keraton Sumenep',
    description: 'Eksplorasi bangun ruang melalui aset komik Keraton Sumenep.',
    comicFolder: 'keraton-sumenep',
    image: '/comics/keraton-sumenep/cover.webp',
    materialName: 'Keraton Sumenep',
    color: 'bg-green-500',
    learningObjectives: ['Mengidentifikasi bangun ruang pada Keraton Sumenep', 'Membandingkan pola yang berulang', 'Menghubungkan pengetahuan dengan pengalaman sehari-hari'],
    characters: ['Aris', 'Naya', 'Bu Rani'],
    storyIntro: 'Aris dan Naya mengunjungi Keraton Sumenep dan mengaitkan bentuk bangunannya dengan konsep bangun ruang.',
  },
};

const createDefaultSession = (comicId: string): CinaraiSessionData => ({
  userId: '',
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedStages: [],
  stageData: {},
  aiInteractions: 0,
  xp: 0,
  badges: [],
  masteryPercentage: 0,
  durationSeconds: 0,
  reflection: '',
});

export function CinaraiComicLearning({ comicId }: CinaraiComicLearningProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const db = useFirestore();

  const normalizedComicId = comicId;
  const comic = COMIC_DATA[normalizedComicId] || COMIC_DATA['komik-1'];
  const [session, setSession] = useState<CinaraiSessionData>(() => createDefaultSession(normalizedComicId));
  const [isSaving, setIsSaving] = useState(false);
  const [clockTick, setClockTick] = useState(0);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const activeProfile = user?.uid && profile?.uid === user.uid ? profile : null;
  const shouldRestart = searchParams.get('restart') === '1';
  const comicPdfUrl = useMemo(
    () => `/comics/${comic.comicFolder}/${comic.comicFolder}.pdf`,
    [comic.comicFolder]
  );

  useEffect(() => {
    const interval = window.setInterval(() => setClockTick((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!shouldRestart || !user?.uid || !db) return;

    const resetSession = async () => {
      const defaultSession = createDefaultSession(comicId);
      setSession(defaultSession);
      setIsSaving(true);

      try {
        await updateDoc(doc(db, 'users', user.uid), {
          [`comicProgress.${comicId}`]: {
            ...defaultSession,
            userId: user.uid,
            updatedAt: new Date().toISOString(),
            durationSeconds: 0,
          },
        });
        router.replace(`/comics/${comicId}`);
      } catch (error) {
        console.error('Gagal mereset progres komik CINARAI', error);
        toast({
          variant: 'destructive',
          title: 'Gagal mereset progres',
          description: 'Periksa koneksi internetmu lalu coba lagi.',
        });
      } finally {
        setIsSaving(false);
      }
    };

    void resetSession();
  }, [comicId, db, router, shouldRestart, toast, user?.uid]);

  useEffect(() => {
    const defaultSession = createDefaultSession(normalizedComicId);
    setSession(defaultSession);

    if (!user?.uid || !activeProfile) {
      return;
    }

    const persisted = activeProfile.comicProgress?.[comicId] as CinaraiSessionData | undefined;
    if (persisted) {
      setSession({
        ...defaultSession,
        ...persisted,
        completedStages: persisted.completedStages ?? [],
        stageData: persisted.stageData ?? {},
        aiInteractions: persisted.aiInteractions ?? 0,
        xp: persisted.xp ?? 0,
        masteryPercentage: persisted.masteryPercentage ?? calculateMasteryPercentage(persisted.completedStages ?? []),
        durationSeconds: persisted.durationSeconds ?? 0,
      });
    }
  }, [activeProfile, comicId, user?.uid]);

  const currentStageId = useMemo(() => getNextStageId(session.completedStages), [session.completedStages]);
  const isComicReadingCompleted = Boolean(session.readingCompleted) || Boolean(session.stageData?.reading?.completed);
  const isReadingStage = currentStageId === 'contextualization' && !isComicReadingCompleted;
  const currentStage = useMemo(() => 
    CINARAI_STAGES.find((stage) => stage.id === currentStageId) ?? CINARAI_STAGES[0],
    [currentStageId]
  );

  const elapsedSeconds = useMemo(() => {
    if (!session.startedAt) return 0;
    const startedAt = new Date(session.startedAt).getTime();
    return Math.max(session.durationSeconds, Math.floor((Date.now() - startedAt) / 1000));
  }, [clockTick, session.durationSeconds, session.startedAt]);

  const persistSession = async (nextSession: CinaraiSessionData, completedStageId?: CinaraiStageId, completedPayload?: Record<string, unknown>, shouldMarkComicComplete = false) => {
    if (!db || !user) return;

    setIsSaving(true);

    const updatePayload: UpdateData<DocumentData> = {
      [`comicProgress.${comicId}`]: {
        ...nextSession,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
        durationSeconds: elapsedSeconds,
      },
    };

    if (shouldMarkComicComplete) {
      updatePayload.completedComics = arrayUnion(comicId);
      updatePayload.poin = increment(5);
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), updatePayload);
    } catch (error) {
      console.error('Gagal menyimpan progres komik CINARAI', error);
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan progres',
        description: 'Periksa koneksi internetmu lalu coba lagi.',
      });
    } finally {
      setIsSaving(false);
    }

    if (completedStageId && completedPayload) {
      const stagePayload: CinaraiStagePayload = {
        completed: true,
        completedAt: new Date().toISOString(),
        ...completedPayload,
      };
      setSession((previous) => ({
        ...previous,
        stageData: {
          ...previous.stageData,
          [completedStageId]: stagePayload,
        },
      }));
    }
  };

  const handleStageComplete = async (stageId: CinaraiStageId, payload?: Record<string, unknown>) => {
    const nextCompletedStages = Array.from(new Set([...session.completedStages, stageId]));
    const nextStageData = {
      ...session.stageData,
      [stageId]: {
        completed: true,
        completedAt: new Date().toISOString(),
        ...payload,
      } as CinaraiStagePayload,
    };

    const nextSession: CinaraiSessionData = {
      ...session,
      completedStages: nextCompletedStages,
      stageData: nextStageData,
      updatedAt: new Date().toISOString(),
      aiInteractions: session.aiInteractions,
      xp: calculateSessionXp(nextCompletedStages),
      masteryPercentage: calculateMasteryPercentage(nextCompletedStages),
      durationSeconds: elapsedSeconds,
      reflection: typeof payload?.notes === 'string' && payload.notes.trim() ? payload.notes : session.reflection,
    };

    setSession(nextSession);
    await persistSession(nextSession, stageId, payload, stageId === 'report');

    if (stageId === 'report') {
      toast({
        title: 'Laporan selesai',
        description: 'Progres komik dan hasil belajar telah tersimpan di akunmu.',
      });
      router.push('/comics');
    }
  };

  const handleAiAssist = async (prompt: string) => {
    const nextSession: CinaraiSessionData = {
      ...session,
      aiInteractions: session.aiInteractions + 1,
      updatedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      masteryPercentage: calculateMasteryPercentage(session.completedStages),
      xp: calculateSessionXp(session.completedStages),
    };

    setSession(nextSession);
    await persistSession(nextSession);

    const response = await cinaraiStageGuidance({ stage: currentStageId, prompt });
    return response.response;
  };

  const persistReadingProgress = async (nextPage: number, totalPages: number, readingCompleted: boolean) => {
    if (!db || !user) return;

    const nextSession: CinaraiSessionData = {
      ...session,
      currentPage: nextPage,
      totalPages,
      readingCompleted,
      updatedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      masteryPercentage: calculateMasteryPercentage(session.completedStages),
      xp: calculateSessionXp(session.completedStages),
    };

    setSession(nextSession);
    await updateDoc(doc(db, 'users', user.uid), {
      [`comicProgress.${comicId}`]: {
        ...nextSession,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
        durationSeconds: elapsedSeconds,
      },
    });
  };

  const handleReadingComplete = async (nextPage: number, totalPages: number, readingCompleted: boolean) => {
    if (!db || !user) {
      return;
    }

    const nextSession: CinaraiSessionData = {
      ...session,
      currentPage: nextPage,
      totalPages,
      readingCompleted,
      updatedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      masteryPercentage: calculateMasteryPercentage(session.completedStages),
      xp: calculateSessionXp(session.completedStages),
    };

    setSession(nextSession);
    await updateDoc(doc(db, 'users', user.uid), {
      [`comicProgress.${comicId}`]: {
        ...nextSession,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
        durationSeconds: elapsedSeconds,
      },
    });

    await handleStageComplete('contextualization', {
      readingCompleted,
      currentPage: nextPage,
      totalPages,
    });
  };

  const renderStage = () => {
    const isLocked = currentStageId !== 'cover' && !session.completedStages.includes(currentStageId);
    if (currentStageId === 'cover') {
      return (
        <CoverStage
          onComplete={() => handleStageComplete('cover')}
          coverImage={comic.image}
          storyIntro={comic.storyIntro}
          learningObjectives={comic.learningObjectives}
          characters={comic.characters}
        />
      );
    }

    if (currentStageId === 'contextualization') {
      if (!isComicReadingCompleted) {
        return (
          <PdfComicReader
            pdfUrl={comicPdfUrl}
            comicTitle={comic.title}
            session={session}
            onPageChange={(nextPage, totalPages, readingCompleted) => {
              void persistReadingProgress(nextPage, totalPages, readingCompleted);
            }}
            onReadingComplete={(nextPage, totalPages, readingCompleted) => {
              void handleReadingComplete(nextPage, totalPages, readingCompleted);
            }}
            onExit={() => {
              const completedPage = Math.max(1, Math.min(session.currentPage ?? 1, session.totalPages ?? 1));
              void handleReadingComplete(completedPage, session.totalPages ?? 1, true);
            }}
          />
        );
      }

      return (
        <ContextualizationStage
          onComplete={(payload) => handleStageComplete('contextualization', payload)}
          onAiAssist={handleAiAssist}
        />
      );
    }

    if (currentStageId === 'identification') {
      return (
        <IdentificationStage
          onComplete={(payload) => handleStageComplete('identification', payload)}
          onAiAssist={handleAiAssist}
        />
      );
    }

    if (currentStageId === 'navigation') {
      return (
        <NavigationStage
          onComplete={(payload) => handleStageComplete('navigation', payload)}
          onAiAssist={handleAiAssist}
        />
      );
    }

    if (currentStageId === 'argumentation') {
      return (
        <ArgumentationStage
          onComplete={(payload) => handleStageComplete('argumentation', payload)}
          onAiAssist={handleAiAssist}
        />
      );
    }

    if (currentStageId === 'resolution') {
      return (
        <ResolutionStage
          onComplete={(payload) => handleStageComplete('resolution', payload)}
          onAiAssist={handleAiAssist}
        />
      );
    }

    if (currentStageId === 'application') {
      return (
        <ApplicationStage
          onComplete={(payload) => handleStageComplete('application', payload)}
          onAiAssist={handleAiAssist}
        />
      );
    }

    if (currentStageId === 'introspection') {
      return (
        <IntrospectionStage
          onComplete={(payload) => handleStageComplete('introspection', payload)}
          onAiAssist={handleAiAssist}
        />
      );
    }

    return (
      <ReportStage
        session={{
          ...session,
          completedStages: session.completedStages,
          aiInteractions: session.aiInteractions,
          masteryPercentage: calculateMasteryPercentage(session.completedStages),
          durationSeconds: elapsedSeconds,
          xp: calculateSessionXp(session.completedStages),
        }}
        onComplete={() => handleStageComplete('report')}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-0">
      <header className="fixed left-0 right-0 top-16 z-40 h-16 border-b bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/comics">
            <Button variant="ghost" size="icon" className="rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-center px-2">
            <div className="min-w-0 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600">CINARAI Smart Learning</p>
              <h1 className="truncate text-sm font-bold text-slate-900">{comic.title}</h1>
            </div>
          </div>
          {isReadingStage ? (
            <Button variant="ghost" size="sm" className="rounded-lg px-3 text-xs font-semibold text-slate-700" onClick={() => setIsProgressOpen((value) => !value)}>
              {isProgressOpen ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}
              Progress
            </Button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      <main className={cn('mx-auto flex w-full max-w-screen-xl flex-col pt-32', isReadingStage ? 'min-h-screen px-0 pb-0' : 'gap-5 px-4 pb-8 sm:px-6 lg:px-8')}>
        {!isReadingStage ? (
        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm">
              <Image src={comic.image} alt={comic.title} width={1000} height={640} className="h-60 w-full object-cover sm:h-72" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className={cn('inline-flex rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white', comic.color)}>
                  {comic.materialName}
                </div>
                <h2 className="mt-3 text-2xl font-headline font-bold">Critical Numeracy with AR & AI</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">{comic.description}</p>
              </div>
            </div>

            <Card className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Tahap saat ini</p>
                  <p className="text-lg font-bold text-slate-900">{currentStage?.title}</p>
                </div>
                <div className="rounded-md bg-blue-50 px-3 py-2 text-right text-xs font-semibold text-blue-700">
                  {session.completedStages.length}/{CINARAI_STAGES.length} selesai
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>{currentStage?.subtitle}</span>
              </div>
            </Card>
          </div>

          <aside className="space-y-6">
            <CinaraiStageProgress completedStages={session.completedStages} currentStageId={currentStageId} />

            <Card className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Alur bertahap sesuai blueprint</span>
              </div>
              <p className="mt-2 leading-relaxed">
                Kamu tidak bisa melewati tahapan. Setiap langkah akan dibuka setelah tahap sebelumnya selesai dan otomatis tersimpan di akunmu.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Durasi belajar: {Math.floor(elapsedSeconds / 60)} menit {elapsedSeconds % 60} detik</span>
              </div>
            </Card>
          </aside>
        </div>
      ) : null}

        {isReadingStage ? (
          <div className="px-3 pb-3 pt-2">
            <Button variant="ghost" className="w-full justify-between rounded-lg border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" onClick={() => setIsProgressOpen((value) => !value)}>
              <span>Learning Progress</span>
              {isProgressOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {isProgressOpen ? (
              <div className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm">
                <CinaraiStageProgress completedStages={session.completedStages} currentStageId={currentStageId} compact />
                <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Tahap sekarang</p>
                    <p className="mt-1 font-semibold text-slate-900">{currentStage?.title}</p>
                  </div>
                  <Button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={() => {
                    const completedPage = Math.max(1, Math.min(session.currentPage ?? 1, session.totalPages ?? 1));
                    void handleReadingComplete(completedPage, session.totalPages ?? 1, true);
                  }}>
                    Continue
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {isSaving ? (
          <div className="mx-4 mt-2 flex items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan progresmu...
          </div>
        ) : null}

        {renderStage()}

        {!isReadingStage ? (
          <Card className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <BookOpen className="h-4 w-4 text-primary" />
              Alur bertahap sesuai blueprint
            </div>
            <p className="mt-2 leading-relaxed">
              Kamu tidak bisa melewati tahapan. Setiap langkah akan dibuka setelah tahap sebelumnya selesai dan otomatis tersimpan di akunmu.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Durasi belajar: {Math.floor(elapsedSeconds / 60)} menit {elapsedSeconds % 60} detik</span>
            </div>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
