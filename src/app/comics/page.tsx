'use client';

import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ComicLibraryGrid } from '@/components/comics/ComicLibraryGrid';
import { useUser } from '@/firebase';

export default function ComicListPage() {
  const { profile } = useUser();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="fixed left-0 right-0 top-16 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="flex items-center gap-2 text-lg font-bold text-slate-900 font-headline">
            <BookOpen className="h-5 w-5 text-primary" />
            Komik Digital
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-xl space-y-6 px-4 pt-36 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 font-headline">Perpustakaan Komik</h2>
          <p className="text-sm text-muted-foreground">Pilih komik dan lanjutkan progres membacamu.</p>
        </div>

        <ComicLibraryGrid basePath="/comics" profile={profile} />
      </main>
    </div>
  );
}
