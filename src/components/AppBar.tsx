
'use client';

import { useUser } from "@/firebase";
import { ArrowLeft, Star, Box } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function isLearningMode(pathname: string) {
  return /^\/(komik|comics)\/[^/]+/.test(pathname);
}

function formatComicTitle(pathname: string) {
  const id = pathname.split('/').filter(Boolean)[1] ?? 'comic';
  return id
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getLearningSyntaxLabel(pathname: string) {
  if (pathname.includes('context')) return 'Contextualization';
  if (pathname.includes('ident')) return 'Identification';
  if (pathname.includes('nav')) return 'Navigation';
  if (pathname.includes('arg')) return 'Argumentation';
  if (pathname.includes('res')) return 'Resolution';
  if (pathname.includes('app')) return 'Application';
  if (pathname.includes('int')) return 'Introspection';
  return 'CINARAI';
}

export function AppBar() {
  const { profile } = useUser();
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);

  if (!profile) return null;

  const isStudent = profile.peran === 'siswa';
  const isLearning = isLearningMode(pathname);
  const comicTitle = formatComicTitle(pathname);
  const currentSyntax = getLearningSyntaxLabel(pathname);

  if (isLearning) {
    return (
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto grid h-11 w-full max-w-screen-xl grid-cols-[40px_minmax(0,1fr)_56px] items-center gap-2 px-2 sm:px-3">
          <Link
            href="/komik"
            aria-label="Back to comics"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0 text-center">
            <p className="truncate text-[13px] font-semibold leading-tight text-slate-950">{comicTitle}</p>
            <div className="mt-0.5 flex items-center justify-center gap-1.5">
              <span className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{currentSyntax}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
              <span className="text-[10px] font-semibold text-slate-500">Progress</span>
            </div>
          </div>

          <div className="flex items-center justify-end" aria-label="Learning progress">
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/2 rounded-full bg-primary transition-all duration-500" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md android-shadow">
      <div className="mx-auto flex h-11 w-full max-w-screen-xl items-center justify-between gap-2 px-2 sm:px-3 lg:px-4">
        <Link href={isStudent ? "/" : "/teacher"} className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative h-7 w-7 shrink-0 rounded-lg bg-primary/10 p-1">
            {!imgError ? (
              <Image 
                src="/images/ethno-arith-logo.svg" 
                alt="ETHNO-ARITH Logo" 
                fill 
                className="object-contain"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary">
                <Box className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-slate-400">CINARAI</p>
            <h1 className="truncate font-headline text-[13px] font-bold leading-tight tracking-tight text-primary">ETHNO-ARITH</h1>
          </div>
        </Link>
        
        <div className="flex shrink-0 items-center gap-1.5">
          {isStudent && (
            <div className="flex h-8 items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2" aria-label={`${profile.poin || 0} XP`}>
              <Star className="h-3.5 w-3.5 fill-current text-accent" aria-hidden="true" />
              <span className="text-[10px] font-bold text-accent">{profile.poin || 0} XP</span>
            </div>
          )}
          <Link href="/profile" aria-label="Open profile" className="block h-8 w-8 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-100 shadow-sm transition hover:ring-2 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
             <img 
              src={`https://picsum.photos/seed/${profile.uid}/100/100`} 
              alt="Profile" 
              className="h-full w-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100/100?text=Avatar';
              }}
             />
          </Link>
        </div>
      </div>
    </header>
  );
}
