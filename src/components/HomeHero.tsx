'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, Compass, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface HomeHeroProps {
  firstName?: string;
  title?: string;
  subtitle?: string;
  activeComicLabel?: string;
  activeComicTitle?: string;
  activeComicHref?: string;
  ctaLabel?: string;
  progressPercent?: number;
  currentStageLabel?: string;
  currentStageSubtitle?: string;
}

const journeySteps = [
  'Comic Cover',
  'Contextualization',
  'Identification',
  'Navigation',
  'Argumentation',
  'Resolution',
  'Application',
  'Introspection',
  'Learning Result',
];

export function HomeHero({
  firstName = 'Siswa',
  title = 'CINARAI Learning Journey',
  subtitle = 'Ikuti satu perjalanan belajar yang terarah dari sampul komik sampai hasil belajar.',
  activeComicLabel = 'Saat ini',
  activeComicTitle = 'Bangun Ruang Candi Jawi',
  activeComicHref = '/comics/komik-1',
  ctaLabel = 'Lanjutkan belajar',
  progressPercent = 0,
  currentStageLabel = 'Navigation',
  currentStageSubtitle = 'Jelajah AR dan AI untuk memahami bentuk bangun ruang.',
}: HomeHeroProps) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            CINARAI Smart Learning
          </div>
          <div className="space-y-2">
            <h2 className="text-[clamp(1.5rem,2.4rem,2.2rem)] font-semibold leading-tight tracking-tight text-slate-900">
              Halo, {firstName}
            </h2>
            <p className="text-sm leading-6 text-slate-600 sm:text-[15px]">{subtitle}</p>
          </div>

          <Card className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3 shadow-none">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{activeComicLabel}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{activeComicTitle}</p>
                <p className="mt-1 text-sm text-slate-600">{currentStageLabel} • {currentStageSubtitle}</p>
              </div>
              <Link href={activeComicHref} className="w-full sm:w-auto">
                <Button className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-auto">
                  <BookOpen className="mr-2 h-4 w-4" />
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        <div className="w-full max-w-md space-y-3">
          <Card className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Perjalanan</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
              </div>
              <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
                <Compass className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {journeySteps.map((step, index) => {
                const isCurrent = step === currentStageLabel;
                return (
                  <div key={step} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${isCurrent ? 'border-primary/20 bg-primary/10 text-primary' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${isCurrent ? 'bg-primary text-white' : 'bg-white text-slate-500'}`}>
                      {index + 1}
                    </div>
                    <span className="flex-1">{step}</span>
                    {isCurrent ? <Target className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>Progress perjalanan</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, progressPercent)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
