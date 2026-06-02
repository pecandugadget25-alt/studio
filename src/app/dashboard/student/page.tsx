
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  CheckCircle2,
  Loader2,
  Castle,
  Dices,
  Landmark,
  ChevronRight,
  TrendingUp,
  Camera,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: 'batik', name: 'Batik Nusantara', icon: MapPin, color: 'bg-orange-500', tag: 'Simetri' },
  { id: 'candi', name: 'Candi Nusantara', icon: Castle, color: 'bg-primary', tag: 'Geometri' },
  { id: 'masjid', name: 'Masjid Al Akbar', icon: Landmark, color: 'bg-emerald-600', tag: 'Numerasi' },
  { id: 'games', name: 'Permainan Tradisional', icon: Dices, color: 'bg-red-500', tag: 'Logika' },
];

export default function StudentDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useUser();
  const [recommendations, setRecommendations] = useState<PersonalizedLearningRecommendationOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile && !recommendations && !aiLoading) {
      async function fetchRecommendations() {
        setAiLoading(true);
        try {
          const result = await personalizedLearningRecommendation({
            studentName: profile?.nama || "Siswa",
            recentQuizResults: [{ moduleName: "Batik Simetri", score: 80, difficulty: "sedang" }],
            completedModules: profile?.completedModules || [],
            availableModules: MODULES.map(m => m.name),
            availableBadges: ["Ahli Geometri Batik", "Penjelajah Candi Nusantara", "Ahli Matematika Masjid", "Juara Numerasi", "Penjaga Budaya Nusantara"]
          });
          setRecommendations(result);
        } catch (error) {
          console.error("AI Flow failed:", error);
          setRecommendations({
            nextChallenge: "Teruslah bereksplorasi!",
            motivationMessage: "Ayo selesaikan tantangan berikutnya dan raih lebih banyak lencana.",
            recommendations: [],
            areasForImprovement: [],
            suggestedBadge: "Ahli Geometri Batik"
          });
        } finally {
          setAiLoading(false);
        }
      }
      fetchRecommendations();
    }
  }, [profile?.uid, recommendations, aiLoading]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const currentLevel = profile?.level || 1;
  const currentXPInLevel = (profile?.poin || 0) % 100;
  const progressPercent = (currentXPInLevel / 100) * 100;

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 bg-slate-50 min-h-screen overflow-y-auto">
      {/* Level Card */}
      <section className="bg-primary rounded-3xl p-6 text-primary-foreground shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-headline font-bold">Level {currentLevel}</h2>
            <p className="text-xs opacity-80">Lanjutkan belajarmu!</p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl">
            <Star className="h-6 w-6 fill-current" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>{currentXPInLevel} / 100 XP</span>
            <span>Level {currentLevel + 1}</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/20" />
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="font-headline font-bold text-sm">Rekomendasi Pintar AI</h3>
        </div>
        <Card className="rounded-2xl border-none bg-accent/10 overflow-hidden min-h-[140px] flex flex-col justify-center">
          {aiLoading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="animate-spin h-5 w-5 text-accent" />
            </div>
          ) : recommendations ? (
            <div className="p-5 space-y-3">
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Saran Untukmu</p>
              <h4 className="font-bold text-sm leading-snug">{recommendations.nextChallenge}</h4>
              <p className="text-xs text-muted-foreground italic">"{recommendations.motivationMessage}"</p>
              <Link href="/modules" className="block mt-2">
                <Button size="sm" className="w-full bg-accent hover:bg-accent/90 font-bold rounded-xl h-10 shadow-sm">
                  Lanjutkan Petualangan
                </Button>
              </Link>
            </div>
          ) : (
             <div className="p-5 text-center text-xs text-muted-foreground italic">
               Rekomendasi akan muncul setelah kamu menyelesaikan kuis pertama.
             </div>
          )}
        </Card>
      </section>

      {/* Learning Path */}
      <section className="space-y-4 pt-2">
        <h3 className="font-headline font-bold text-sm px-1 text-slate-900">Modul Pembelajaran</h3>
        <div className="grid grid-cols-1 gap-4">
          {MODULES.map((mod) => {
            const isCompleted = profile?.completedModules?.includes(mod.id);
            return (
              <Link key={mod.id} href={`/modules/${mod.id}`}>
                <Card className={cn(
                  "border-none rounded-2xl overflow-hidden shadow-sm transition-transform active:scale-95",
                  isCompleted ? "bg-slate-50/50" : "bg-white"
                )}>
                  <div className="flex items-center p-4 gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md",
                      mod.color
                    )}>
                      <mod.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{mod.tag}</span>
                        {isCompleted && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      </div>
                      <h4 className="font-bold text-sm truncate">{mod.name}</h4>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
