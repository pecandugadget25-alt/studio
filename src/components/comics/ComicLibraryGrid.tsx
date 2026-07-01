'use client';

import { ComicCard } from '@/components/comics/ComicCard';
import { COMIC_LIBRARY, type ComicLibraryItem } from '@/lib/comic-library';

type ComicProgress = {
  currentPage?: number;
  totalPages?: number;
  readingCompleted?: boolean;
  completedStages?: string[];
  masteryPercentage?: number;
};

type ComicLibraryGridProps = {
  basePath: '/komik' | '/comics';
  profile?: {
    completedComics?: string[];
    comicProgress?: Record<string, unknown>;
  } | null;
};

function getReadingState(comic: ComicLibraryItem, progress?: ComicProgress, isCompleted = false) {
  const totalPages = progress?.totalPages || comic.pageCount;
  const currentPage = Math.max(0, Math.min(progress?.currentPage ?? 0, totalPages));
  const hasStarted = currentPage > 0 || Boolean(progress?.completedStages?.length);
  const readingCompleted = isCompleted || Boolean(progress?.readingCompleted);
  const percent = readingCompleted
    ? 100
    : hasStarted
      ? Math.min(99, Math.round((Math.max(currentPage, 1) / totalPages) * 100))
      : 0;
  const status = readingCompleted ? 'Selesai' : hasStarted ? 'Sedang Dibaca' : 'Belum Dibaca';
  const buttonLabel = hasStarted || readingCompleted ? 'Lanjutkan Membaca' : 'Mulai Membaca';

  return { currentPage, totalPages, percent, status, buttonLabel, readingCompleted };
}

function isComicProgress(value: unknown): value is ComicProgress {
  return Boolean(value && typeof value === 'object');
}

export function ComicLibraryGrid({ basePath, profile }: ComicLibraryGridProps) {
  const currentComicId = profile?.comicProgress && typeof profile.comicProgress === 'object'
    ? Object.keys(profile.comicProgress).find((id) => COMIC_LIBRARY.some((comic) => comic.id === id))
    : undefined;

  const completedIds = new Set(profile?.completedComics ?? []);
  const currentIndex = currentComicId ? COMIC_LIBRARY.findIndex((comic) => comic.id === currentComicId) : 0;

  const sections = COMIC_LIBRARY.map((comic, index) => {
    const savedProgress = profile?.comicProgress?.[comic.id];
    const progress = isComicProgress(savedProgress) ? savedProgress : undefined;
    const isCompleted = completedIds.has(comic.id);
    const isCurrent = comic.id === currentComicId;
    const hasStarted = Boolean(progress?.currentPage || progress?.completedStages?.length || progress?.readingCompleted);
    const isLocked = !isCurrent && !isCompleted && index > (currentIndex >= 0 ? currentIndex : 0);
    const reading = getReadingState(comic, progress, isCompleted);

    let status: 'current' | 'continue' | 'locked' | 'completed' = 'locked';
    let buttonLabel = 'Terkunci';
    let subtitle = 'Selesaikan komik sebelumnya untuk membuka bab ini.';

    if (isCompleted) {
      status = 'completed';
      buttonLabel = '✓ Completed';
      subtitle = 'Kamu telah menyelesaikan perjalanan ini.';
    } else if (isCurrent || hasStarted) {
      status = 'continue';
      buttonLabel = reading.buttonLabel;
      subtitle = reading.status === 'Sedang Dibaca' ? 'Lanjutkan membaca komik ini.' : 'Mulai petualangan learning journey ini.';
    } else if (isLocked) {
      status = 'locked';
      buttonLabel = 'Terkunci';
      subtitle = 'Selesaikan komik sebelumnya untuk membuka bab ini.';
    } else {
      status = 'current';
      buttonLabel = 'Mulai Journey';
      subtitle = 'Mulai perjalanan belajar dari komik ini.';
    }

    return (
      <ComicCard
        key={comic.id}
        comic={comic}
        status={status}
        href={`${basePath}/${comic.id}`}
        buttonLabel={buttonLabel}
        subtitle={subtitle}
      />
    );
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Learning Journey</p>
        <p className="mt-1 font-semibold text-slate-900">Ikuti satu bab demi bab sampai kamu sampai ke hasil belajar.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sections}</div>
    </div>
  );
}
