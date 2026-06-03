'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Star, ChevronRight, Loader2, Sparkles, Trophy } from "lucide-react";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { generateLearningChallenge, type LearningChallengeOutput } from "@/ai/flows/learning-challenge-generator";
import Link from "next/link";

const DAILY_CHALLENGES = [
  { id: 1, title: "Baca 1 Komik Budaya", xp: "+5 XP", icon: Target, completed: false },
  { id: 2, title: "Selesaikan 1 Kuis Modul", xp: "+20 XP", icon: Star, completed: false },
  { id: 3, title: "Gunakan AR Scanner", xp: "+10 XP", icon: Zap, completed: true },
];

export default function ChallengesPage() {
  const { profile, loading } = useUser();
  const [aiChallenge, setAiChallenge] = useState<LearningChallengeOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (profile && !aiChallenge && !aiLoading) {
      async function fetchAiChallenge() {
        setAiLoading(true);
        try {
          const result = await generateLearningChallenge({
            xp: profile?.poin || 0,
            level: profile?.level || 1,
            completedModules: profile?.completedModules || [],
            quizScore: 85 // Mock or fetch from quiz_results
          });
          setAiChallenge(result);
        } catch (error) {
          console.error("Failed to load AI challenge", error);
        } finally {
          setAiLoading(false);
        }
      }
      fetchAiChallenge();
    }
  }, [profile?.uid, aiChallenge, aiLoading]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 max-w-[500px] mx-auto min-h-screen bg-slate-50/50 overflow-y-auto">
      <div className="px-1">
        <h2 className="text-2xl font-headline font-bold text-slate-900">Tantangan Harian</h2>
        <p className="text-sm text-muted-foreground font-medium">Selesaikan untuk klaim XP tambahan!</p>
      </div>

      {/* AI Special Generated Challenge */}
      <Card className="border-none rounded-[2.5rem] bg-gradient-to-br from-accent to-orange-600 text-white overflow-hidden shadow-xl relative group">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-yellow-200" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Tantangan Spesial AI</span>
          </div>
          <CardTitle className="text-xl leading-tight font-headline">
            {aiLoading ? "Memikirkan tantangan..." : aiChallenge?.title || "Tantangan Baru Menantimu"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-5">
          <p className="text-sm opacity-90 font-medium leading-relaxed">
            {aiLoading ? "Sedang merancang misi numerasi khusus untukmu..." : aiChallenge?.description}
          </p>
          
          <div className="flex items-center justify-between items-end pt-2">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
              <Trophy className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-bold">+{aiChallenge?.rewardXP || 0} XP</span>
            </div>
            <Link href="/modules" className="flex-1 ml-4">
              <Button className="w-full bg-white text-accent hover:bg-slate-50 font-bold rounded-2xl h-12 shadow-lg transition-transform active:scale-95">
                Mulai Misi
              </Button>
            </Link>
          </div>
        </CardContent>
        <div className="absolute -right-8 -top-8 bg-white/10 w-32 h-32 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 bg-black/10 w-24 h-24 rounded-full blur-2xl" />
      </Card>

      {/* List Regular Daily Challenges */}
      <div className="space-y-4">
        <h3 className="font-headline font-bold text-sm px-1 text-slate-900">Aktivitas Rutin</h3>
        <div className="space-y-3">
          {DAILY_CHALLENGES.map((challenge) => {
            const Icon = challenge.icon;
            return (
              <Card key={challenge.id} className="border-none rounded-3xl bg-white shadow-sm overflow-hidden active:scale-[0.98] transition-all">
                <div className="flex items-center p-4 gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${challenge.completed ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${challenge.completed ? 'line-through text-slate-300' : 'text-slate-900'}`}>
                      {challenge.title}
                    </h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 text-accent fill-current" />
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{challenge.xp}</span>
                    </div>
                  </div>
                  {challenge.completed ? (
                    <div className="bg-green-50 text-green-600 p-1.5 rounded-full">
                      <Zap className="h-4 w-4 fill-current" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100/50 flex gap-4 items-start mt-4">
        <div className="p-2 bg-blue-100 rounded-xl text-primary">
          <Star className="h-5 w-5 fill-current" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Tips Pahlawan Numerasi</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Setiap tantangan yang kamu selesaikan akan membantumu naik level lebih cepat dan membuka lencana-lencana keren di profilmu!
          </p>
        </div>
      </div>
    </div>
  );
}
