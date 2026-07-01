'use client';

import Link from 'next/link';
import { LockOpen, Play } from 'lucide-react';

type NextComicUnlockProps = {
  title?: string;
  href?: string;
};

export function NextComicUnlock({ title = 'Next Comic', href = '/komik' }: NextComicUnlockProps) {
  return (
    <Link href={href} className="group block rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 transition hover:border-emerald-300 hover:bg-emerald-100">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white transition group-hover:scale-105">
          <LockOpen className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Unlock Next Comic</p>
          <h3 className="truncate text-lg font-bold">{title}</h3>
        </div>
        <Play className="h-5 w-5 shrink-0 text-emerald-700" />
      </div>
    </Link>
  );
}
