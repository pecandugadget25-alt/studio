'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
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
  moduleLink: string;
  image: string;
  moduleName: string;
  color: string;
  learningObjectives: string[];
  characters: string[];
  storyIntro: string;
}> = {
  'komik-1': {
    title: 'Misteri Simetri Batik',
    description: 'Ikuti petualangan Adi menemukan rahasia matematika di balik motif batik parang yang indah.',
    comicFolder: 'candi-jawi',
    moduleLink: '/modules/batik',
    image: 'https://picsum.photos/seed/comic-batik/800/600',
    moduleName: 'Batik Nusantara',
    color: 'bg-orange-500',
    learningObjectives: ['Mengidentifikasi bentuk geometri pada motif batik', 'Menerapkan konsep simetri dalam pola', 'Menjelaskan alasan matematika dari pola yang dilihat'],
    characters: ['Adi', 'Ibu', 'Pak Guru'],
    storyIntro: 'Adi menemukan motif batik yang berulang dan bertanya mengapa pola itu tampak begitu rapi.',
  },
  'komik-2': {
    title: 'Petualangan di Candi Megah',
    description: 'Bantu Maya menghitung blok batu dan memahami bangun ruang di candi Borobudur.',
    comicFolder: 'candi-penataran',
    moduleLink: '/modules/candi',
    image: 'https://picsum.photos/seed/comic-candi/800/600',
    moduleName: 'Candi Nusantara',
    color: 'bg-primary',
    learningObjectives: ['Mengenali bentuk bangun ruang pada candi', 'Menghubungkan ukuran dengan pola susunan', 'Menjelaskan pemecahan masalah numerasi'],
    characters: ['Maya', 'Kakak', 'Arsitek'],
    storyIntro: 'Maya melihat susunan batu candi yang membentuk pola berulang dan ingin memahaminya.',
  },
  'komik-3': {
    title: 'Permainan Tradisional',
    description: 'Eksplorasi strategi berhitung lewat permainan Congklak dan Engklek bersama teman-teman.',
    comicFolder: 'gajah-mungkur',
    moduleLink: '/modules/games',
    image: 'https://picsum.photos/seed/comic-games/800/600',
    moduleName: 'Permainan Nusantara',
    color: 'bg-red-500',
    learningObjectives: ['Menghubungkan permainan dengan konsep bilangan', 'Mengidentifikasi pola strategi', 'Menerapkan hitungan pada situasi nyata'],
    characters: ['Rina', 'Dedi', 'Lia'],
    storyIntro: 'Rina dan teman-temannya menggunakan permainan tradisional untuk memahami pola dan strategi berhitung.',
  },
  'komik-4': {
    title: 'Candi Jawi',
    description: 'Mengenal sejarah dan keunikan Candi Jawi sebagai peninggalan Kerajaan Singhasari.',
    comicFolder: 'jembatan-merah',
    moduleLink: '/modules/candi',
    image: 'https://picsum.photos/seed/comic-candi-jawi/800/600',
    moduleName: 'Candi Nusantara',
    color: 'bg-green-500',
    learningObjectives: ['Mengenali bentuk pada bangunan sejarah', 'Menghubungkan geometri dengan arsitektur', 'Membuat kesimpulan dari pengamatan'],
    characters: ['Naya', 'Kakek', 'Pengunjung'],
    storyIntro: 'Naya mengamati ornamen candi dan melihat banyak bentuk matematika dalam susunannya.',
  },
  'komik-5': {
    title: 'Candi Penataran',
    description: 'Menjelajahi sejarah Candi Penataran sebagai kompleks candi terbesar di Jawa Timur.',
    comicFolder: 'candi-jawi',
    moduleLink: '/modules/candi',
    image: 'https://picsum.photos/seed/comic-candi-penataran/800/600',
    moduleName: 'Candi Nusantara',
    color: 'bg-green-500',
    learningObjectives: ['Mengidentifikasi pola pada struktur candi', 'Menghitung bagian berulang', 'Menjelaskan hubungan antara sejarah dan matematika'],
    characters: ['Ayu', 'Bapak', 'Tim Museum'],
    storyIntro: 'Ayu mempelajari susunan candi dan menemukan banyak pola yang bisa dihitung.',
  },
  'komik-6': {
    title: 'Jembatan Merah',
    description: 'Mempelajari sejarah Jembatan Merah Surabaya dan perannya dalam perjuangan kemerdekaan.',
    comicFolder: 'candi-penataran',
    moduleLink: '/modules/bangunan-bersejarah',
    image: 'https://picsum.photos/seed/comic-jembatan-merah/800/600',
    moduleName: 'Bangunan Bersejarah',
    color: 'bg-blue-500',
    learningObjectives: ['Mengamati pola geometri pada bangunan', 'Menghubungkan sejarah dengan perhitungan', 'Menerapkan numerasi pada konteks lokal'],
    characters: ['Damar', 'Sari', 'Pak Bima'],
    storyIntro: 'Damar melihat Jembatan Merah sebagai tempat penuh kisah dan bentuk-bentuk yang bisa dipelajari.',
  },
  'komik-7': {
    title: 'Keraton Sumenep',
    description: 'Mengenal Keraton Sumenep sebagai pusat pemerintahan dan budaya Madura.',
    comicFolder: 'gajah-mungkur',
    moduleLink: '/modules/bangunan-bersejarah',
    image: 'https://picsum.photos/seed/comic-keraton-sumenep/800/600',
    moduleName: 'Bangunan Bersejarah',
    color: 'bg-blue-500',
    learningObjectives: ['Mengenali elemen bentuk pada arsitektur', 'Membandingkan pola yang berulang', 'Menghubungkan pengetahuan dengan pengalaman sehari-hari'],
    characters: ['Laras', 'Nenek', 'Guide'],
    storyIntro: 'Laras mengunjungi keraton dan menemukan bahwa banyak pola memiliki susunan yang terukur.',
  },
  'komik-8': {
    title: 'Rumah Gajah Mungkur',
    description: 'Menelusuri sejarah Rumah Gajah Mungkur sebagai bangunan bersejarah di Gresik.',
    comicFolder: 'jembatan-merah',
    moduleLink: '/modules/bangunan-bersejarah',
    image: 'https://picsum.photos/seed/comic-gajah-mungkur/800/600',
    moduleName: 'Bangunan Bersejarah',
    color: 'bg-blue-500',
    learningObjectives: ['Membedakan bentuk dan ukuran', 'Menerapkan konsep matematis secara sederhana', 'Menyusun alasan dari hasil pengamatan'],
    characters: ['Tomi', 'Ibu', 'Arif'],
    storyIntro: 'Tomi mengamati rumah bersejarah dan melihat banyak bentuk yang bisa diidentifikasi dengan matematika.',
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

  const comic = COMIC_DATA[comicId] || COMIC_DATA['komik-1'];
  const [session, setSession] = useState<CinaraiSessionData>(() => createDefaultSession(comicId));
  const [isSaving, setIsSaving] = useState(false);
  const [clockTick, setClockTick] = useState(0);
  const activeProfile = user?.uid && profile?.uid === user.uid ? profile : null;
  const shouldRestart = searchParams.get('restart') === '1';
  const comicPdfUrl = useMemo(() => `/comics/${comic.comicFolder}/comic.pdf`, [comic.comicFolder]);

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
    const defaultSession = createDefaultSession(comicId);
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
      reflection: session.reflection,
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
            session={session}
            onPageChange={(nextPage, totalPages, readingCompleted) => {
              void persistReadingProgress(nextPage, totalPages, readingCompleted);
            }}
            onReadingComplete={(nextPage, totalPages, readingCompleted) => {
              void handleReadingComplete(nextPage, totalPages, readingCompleted);
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
    <div className="min-h-screen bg-[#FAF7F5] pb-24">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[500px] items-center justify-between px-6">
          <Link href="/comics">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-center px-2">
            <h1 className="truncate text-center text-sm font-bold text-slate-900">{comic.title}</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto flex max-w-[500px] flex-col gap-5 px-4 pb-8 pt-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 shadow-xl">
          <Image src={comic.image} alt={comic.title} width={800} height={600} className="h-48 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className={cn('inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white', comic.color)}>
              {comic.moduleName}
            </div>
            <h2 className="mt-3 text-xl font-headline font-bold">{comic.title}</h2>
            <p className="mt-2 text-sm text-white/80">{comic.description}</p>
          </div>
        </div>

        <CinaraiStageProgress completedStages={session.completedStages} currentStageId={currentStageId} />

        <Card className="rounded-[1.75rem] border-none bg-white p-4 shadow-lg shadow-orange-100/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Tahap saat ini</p>
              <p className="text-lg font-bold text-slate-900">{currentStage?.title}</p>
            </div>
            <div className="rounded-full bg-orange-100 px-3 py-2 text-right text-xs font-semibold text-orange-700">
              {session.completedStages.length}/{CINARAI_STAGES.length} selesai
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span>{currentStage?.subtitle}</span>
          </div>
        </Card>

        {isSaving ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan progresmu…
          </div>
        ) : null}

        {renderStage()}

        <Card className="rounded-[1.75rem] border-none bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <BookOpen className="h-4 w-4 text-primary" />
            Lanjutkan dari tahap sebelumnya
          </div>
          <p className="mt-2 leading-relaxed">
            Kamu tidak bisa melewati tahapan. Setiap langkah akan dibuka setelah tahap sebelumnya selesai dan otomatis tersimpan di akunmu.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Durasi belajar: {Math.floor(elapsedSeconds / 60)} menit {elapsedSeconds % 60} detik</span>
          </div>
        </Card>
      </main>
    </div>
  );
}
