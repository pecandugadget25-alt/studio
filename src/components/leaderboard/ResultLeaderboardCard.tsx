'use client';

import { Trophy, TrendingUp } from 'lucide-react';

type ResultLeaderboardCardProps = {
  rank?: number;
  xpEarned: number;
};

export function ResultLeaderboardCard({ rank, xpEarned }: ResultLeaderboardCardProps) {
  return (
    <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-blue-950">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <Trophy className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">Leaderboard Progress</p>
          <h3 className="text-lg font-bold">{rank ? `Current Rank #${rank}` : 'XP Added to Ranking'}</h3>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-sm font-bold text-blue-700">
          <TrendingUp className="h-4 w-4" />
          +{xpEarned}
        </div>
      </div>
    </div>
  );
}
