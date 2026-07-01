'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Lock, PlayCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ComicLibraryItem } from '@/lib/comic-library';

type ComicCardStatus = 'current' | 'continue' | 'locked' | 'completed';

interface ComicCardProps {
  comic: ComicLibraryItem;
  status: ComicCardStatus;
  href: string;
  buttonLabel: string;
  subtitle?: string;
}

export function ComicCard({ comic, status, href, buttonLabel, subtitle }: ComicCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <Card className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        <Image
          src={comic.coverImage}
          alt={comic.title}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-700">
          {isLocked ? 'Locked' : isCompleted ? 'Completed' : 'Journey'}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            {isCompleted ? (
              <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> <span>✓ Completed</span></>
            ) : isLocked ? (
              <><Lock className="h-3.5 w-3.5 text-slate-400" /> <span>Locked</span></>
            ) : (
              <><Sparkles className="h-3.5 w-3.5 text-primary" /> <span>Current</span></>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-900">{comic.title}</h3>
          {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
        </div>

        <Link href={href} className="block">
          <div className={cn(
            'flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold',
            isLocked
              ? 'border-slate-200 bg-slate-50 text-slate-500'
              : 'border-primary/15 bg-primary/10 text-primary'
          )}>
            {isLocked ? <Lock className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            <span>{buttonLabel}</span>
          </div>
        </Link>
      </div>
    </Card>
  );
}
