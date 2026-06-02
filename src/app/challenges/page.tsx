'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Star, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";

const DAILY_CHALLENGES = [
  { id: 1, title: "Baca 1 Komik Budaya", xp: "+5 XP", icon: Target, completed: false },
  { id: 2, title: "Selesaikan 1 Kuis Modul", xp: "+20 XP", icon: Star, completed: false },
  { id: 3, title: "Gunakan AR Scanner", xp: "+10 XP", icon: Zap, completed: true },
];

export default function ChallengesPage() {
  const { profile, loading } = useUser();
  const [recommendations, setRecommendations] = useState<PersonalizedLearningRecommendationOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      async function fetchRecommendations() {
        setAiLoading(true);
        try {
          const result = await personalizedLearningRecommendation({
            studentName: profile?.nama || "Siswa",
            recentQuizResults: [{ moduleName: "Batik Simetri", score: 80, difficulty: "sedang" }],
            completedModules: profile.completedModules || [],
            availableModules: ["Batik Nusantara", "Candi Nusantara", "Masjid Al Akbar", "Permainan Tradisional"],
            availableBadges: ["Ahli Geometri Batik", "Penjelajah Candi Nusantara", "Ahli Matematika Masjid", "Juara Numerasi", "Penjaga Budaya Nusantara"]
          });
          setRecommendations(result);
        } catch (error) {
          console.error("Failed to load AI recommendations", error);
        } finally {
          setAiLoading(false);
        }
      }
      fetchRecommendations();
    }
  }, [profile?.uid]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 px-4 space-y-6">
      <div className="px-1">
        <h2 className="text-2xl font-headline font-bold">Tantangan Harian</h2>
        <p className="text-xs text-muted-foreground">Selesaikan tantangan untuk klaim XP tambahan!</p>
      </div>

      {/* AI Special Recommendation */}
      <Card className="border-none rounded-3xl bg-primary text-white overflow-hidden shadow-lg relative">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Tantangan Pintar AI</span>
          </div>
          <CardTitle className="text-lg leading-tight">
            {aiLoading ? "Memilihkan tantangan..." : recommendations?.nextChallenge || "Siap untuk tantangan hari ini?"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs opacity-90 italic">
            {aiLoading ? "Sedang menganalisis progres belajarmu..." : recommendations?.motivationMessage}
          </p>
          <Button className="w-full bg-white text-primary hover:bg-slate-100 font-bold rounded-2xl h-12 shadow-lg">
            Mulai Sekarang
          </Button>
        </CardContent>
        <div className="absolute -right-8 -bottom-8 bg-white/10 w-32 h-32 rounded-full blur-3xl" />
      </Card>

      {/* List Daily Challenges */}
      <div className="space-y-3">
        {DAILY_CHALLENGES.map((challenge) => {
          const Icon = challenge.icon;
          return (
            <Card key={challenge.id} className="border-none rounded-2xl bg-white shadow-sm overflow-hidden active:scale-[0.98] transition-all">
              <div className="flex items-center p-4 gap-4">
                <div className={`p-3 rounded-xl ${challenge.completed ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${challenge.completed ? 'line-through opacity-50' : ''}`}>
                    {challenge.title}
                  </h4>
                  <p className="text-[10px] font-bold text-accent uppercase">{challenge.xp}</p>
                </div>
                {challenge.completed ? (
                  <Badge variant="secondary" className="bg-green-50 text-green-600 border-none text-[10px] font-bold">
                    Selesai
                  </Badge>
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}