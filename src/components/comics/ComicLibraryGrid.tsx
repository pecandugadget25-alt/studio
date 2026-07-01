'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { COMIC_LIBRARY, type ComicLibraryItem } from '@/lib/comic-library';
import { cn } from '@/lib/utils';

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

function ComicCover({ comic }: { comic: ComicLibraryItem }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 px-4 text-center text-sm font-bold text-slate-500">
        {comic.title}
      </div>
    );
  }

  return (
    <Image
      src={comic.coverImage}
      alt={comic.title}
      fill
      sizes="(min-width: 1280px) 240px, (min-width: 768px) 220px, 42vw"
      className="object-cover"
      data-ai-hint={comic.imageHint}
      onError={() => setHasError(true)}
    />
  );
}

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
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {COMIC_LIBRARY.map((comic) => {
        const savedProgress = profile?.comicProgress?.[comic.id];
        const progress = isComicProgress(savedProgress) ? savedProgress : undefined;
        const isCompleted = Boolean(profile?.completedComics?.includes(comic.id));
        const reading = getReadingState(comic, progress, isCompleted);

        return (
          <Card key={comic.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="grid grid-cols-[118px_minmax(0,1fr)] sm:grid-cols-[142px_minmax(0,1fr)]">
              <div className="relative min-h-[184px] border-r border-slate-100 bg-slate-100 sm:min-h-[214px]">
                <ComicCover comic={comic} />
              </div>

              <div className="flex min-w-0 flex-col">
                <CardContent className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">
                        {comic.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{comic.pageCount} halaman</span>
                      </div>
                    </div>
                    {reading.readingCompleted ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    ) : reading.status === 'Sedang Dibaca' ? (
                      <Clock className="h-5 w-5 shrink-0 text-amber-500" />
                    ) : (
                      <PlayCircle className="h-5 w-5 shrink-0 text-slate-400" />
                    )}
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                      <span className={cn(
                        reading.readingCompleted ? 'text-emerald-700' : reading.status === 'Sedang Dibaca' ? 'text-amber-700' : 'text-slate-500'
                      )}>
                        {reading.status}
                      </span>
                      <span className="text-slate-500">{reading.percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={cn(
                        'h-full rounded-full transition-all',
                        reading.readingCompleted ? 'bg-emerald-500' : reading.status === 'Sedang Dibaca' ? 'bg-amber-500' : 'bg-slate-300'
                      )} style={{ width: `${reading.percent}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {reading.currentPage > 0 ? `Halaman ${reading.currentPage} dari ${reading.totalPages}` : 'Belum ada progres membaca'}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Link href={`${basePath}/${comic.id}`} className="w-full">
                    <Button className="h-10 w-full rounded-lg font-semibold">
                      {reading.buttonLabel}
                    </Button>
                  </Link>
                </CardFooter>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
