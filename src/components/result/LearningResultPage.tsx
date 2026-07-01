'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageSquareText, Sparkles } from 'lucide-react';
import { BadgeUnlock, ConfettiBurst, NextComicUnlock, XpCounter } from '@/components/rewards';
import { ResultLeaderboardCard } from '@/components/leaderboard';

export type LearningResultPageProps = {
  comicTitle: string;
  xpEarned: number;
  badgeEarned: string;
  reflectionSummary: string;
  aiFeedback: string;
  nextComicTitle?: string;
  nextComicHref?: string;
  continueHref?: string;
  leaderboardRank?: number;
};

export function LearningResultPage({
  comicTitle,
  xpEarned,
  badgeEarned,
  reflectionSummary,
  aiFeedback,
  nextComicTitle = 'Next Comic',
  nextComicHref = '/komik',
  continueHref = nextComicHref,
  leaderboardRank,
}: LearningResultPageProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <ConfettiBurst />

      <div className="relative z-10 space-y-4">
        <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-200">Comic Completed</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{comicTitle}</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Your CINARAI learning journey is complete. Rewards have been prepared from the existing session data.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4 text-orange-950">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">XP Earned</p>
                <p className="mt-1 text-4xl font-black leading-none">
                  +<XpCounter value={xpEarned} />
                </p>
              </div>
              <Sparkles className="h-9 w-9 text-orange-500" />
            </div>
          </div>
          <BadgeUnlock badge={badgeEarned} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-950">
              <MessageSquareText className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold">Reflection Summary</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{reflectionSummary}</p>
          </article>

          <article className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-950">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold">AI Feedback</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-blue-900">{aiFeedback}</p>
          </article>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <NextComicUnlock title={nextComicTitle} href={nextComicHref} />
          <ResultLeaderboardCard rank={leaderboardRank} xpEarned={xpEarned} />
        </div>

        <Link
          href={continueHref}
          className="flex h-16 w-full items-center justify-center rounded-3xl bg-blue-600 px-6 text-base font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99]"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}
