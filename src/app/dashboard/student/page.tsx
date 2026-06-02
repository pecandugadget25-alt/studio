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
  BookOpen,
  ChevronRight,
  TrendingUp,
  Camera
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";

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
    if (profile) {
      async function fetchRecommendations() {
        setAiLoading(true);
        try {
          const result = await personalizedLearningRecommendation({
            studentName: profile?.nama || "Siswa",
            recentQuizResults: [{ moduleName: "Batik Simetri", score: 80, difficulty: "sedang" }],
            completedModules: profile.completedModules || [],
            availableModules: MODULES.map(m => m.name),
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
  }, [profile?.poin]);

  if (authLoading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentLevel = profile.level || 1;
  const currentXPInLevel = profile.poin % 100;
  const progressPercent = (currentXPInLevel / 100) * 100;

  return (
    <div className="pt-20 pb-24 px-4 space-y-6">
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
            <span>Next Level</span>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/20" />
        </div>
      </section>

      {/* AI Recommendation Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h3 className="font-headline font-bold text-sm">Tantangan Pintar AI</h3>
        </div>
        <Card className="rounded-2xl border-none bg-accent/10 overflow-hidden">
          {aiLoading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="animate-spin h-5 w-5 text-accent" />
            </div>
          ) : recommendations ? (
            <div className="p-5 space-y-3">
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Saran Untukmu</p>
              <h4 className="font-bold text-sm leading-snug">{recommendations.nextChallenge}</h4>
              <p className="text-xs text-muted-foreground italic">"{recommendations.motivationMessage}"</p>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90 font-bold rounded-xl mt-2 h-10">
                Terima Tantangan
              </Button>
            </div>
          ) : null}
        </Card>
      </section>

      {/* AR Quick Action */}
      <Link href="/ar-scan" className="block">
        <Card className="bg-slate-900 border-none rounded-2xl p-4 flex items-center justify-between text-white overflow-hidden relative shadow-lg">
          <div className="z-10">
            <h3 className="font-bold text-sm mb-1">Visualisasi AR</h3>
            <p className="text-[10px] opacity-70">Lihat bangun ruang di dunia nyata</p>
          </div>
          <div className="bg-white/10 p-3 rounded-full z-10">
            <Camera className="h-6 w-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 bg-primary/20 w-24 h-24 rounded-full blur-2xl" />
        </Card>
      </Link>

      {/* Learning Path Simulation */}
      <section className="space-y-4 pt-2">
        <h3 className="font-headline font-bold text-sm px-1">Mulai Petualangan</h3>
        <div className="grid grid-cols-1 gap-4">
          {MODULES.map((mod, idx) => {
            const isCompleted = profile.completedModules?.includes(mod.id);
            return (
              <Link key={mod.id} href={`/modules/${mod.id}`}>
                <Card className={cn(
                  "border-none rounded-2xl overflow-hidden shadow-sm transition-transform active:scale-95",
                  isCompleted ? "bg-slate-50" : "bg-white"
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

      {/* Quick Comic Access */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-sm">Literasi Budaya</h3>
          <Link href="/comics" className="text-xs font-bold text-primary">Lihat Semua</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          {[
            { id: 'komik-1', title: 'Misteri Batik', img: 'comic-batik' },
            { id: 'komik-2', title: 'Candi Megah', img: 'comic-candi' },
          ].map((comic) => (
            <Link key={comic.id} href={`/comics/${comic.id}`} className="shrink-0 w-32">
              <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden mb-2 shadow-sm border relative">
                <img 
                  src={`https://picsum.photos/seed/${comic.img}/300/400`} 
                  alt={comic.title} 
                  className="w-full h-full object-cover" 
                />
                {profile.completedComics?.includes(comic.id) && (
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold truncate px-1">{comic.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}