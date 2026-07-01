'use client';

import { Award, Sparkles } from 'lucide-react';

type BadgeUnlockProps = {
  badge: string;
};

export function BadgeUnlock({ badge }: BadgeUnlockProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <div className="absolute right-4 top-4 text-amber-300">
        <Sparkles className="h-5 w-5 animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 animate-[cinarai-badge-pop_700ms_cubic-bezier(0.2,0.8,0.2,1)_both] items-center justify-center rounded-3xl bg-amber-400 text-white shadow-lg shadow-amber-200">
          <Award className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">Badge Earned</p>
          <h3 className="truncate text-xl font-bold">{badge}</h3>
        </div>
      </div>
      <style jsx>{`
        @keyframes cinarai-badge-pop {
          0% {
            opacity: 0;
            transform: scale(0.65) rotate(-8deg);
          }
          70% {
            opacity: 1;
            transform: scale(1.08) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
