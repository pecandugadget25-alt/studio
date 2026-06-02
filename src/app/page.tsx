
'use client';

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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
  Flame,
  Award,
  Bell,
  Search,
  Zap,
  Trophy,
  BookOpen,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: 'batik', name: 'Batik Nusantara', icon: MapPin, color: 'bg-orange-500', tag: 'Simetri', progress: 75, img: 'batik-pattern' },
  { id: 'candi', name: 'Candi Nusantara', icon: Castle, color: 'bg-primary', tag: 'Geometri', progress: 30, img: 'borobudur-temple' },
  { id: 'masjid', name: 'Masjid Al Akbar', icon: Landmark, color: 'bg-emerald-500', tag: 'Numerasi', progress: 0, img: 'mosque-architecture' },
  { id: 'games', name: 'Permainan Tradisional', icon: Dices, color: 'bg-red-500', tag: 'Logika', progress: 10, img: 'traditional-games' },
];

export default function MobileDashboard() {
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
    // Only fetch if profile exists and we haven't fetched yet
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
          console.error("AI Recommendation failed, using defaults:", error);
          // Set silent fallback so it doesn't try again and again
          setRecommendations({
            nextChallenge: "Selesaikan materi Batik hari ini!",
            motivationMessage: "Setiap langkah kecil membawamu lebih dekat ke puncak prestasi.",
            recommendations: [],
            areasForImprovement: [],
            suggestedBadge: "Juara Numerasi"
          });
        } finally {
          setAiLoading(false);
        }
      }
      fetchRecommendations();
    }
  }, [profile?.uid, recommendations, aiLoading]);

  // Defensive: Handle loading and non-existent profile
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Let the useEffect router.push handle redirection
  }

  const currentLevel = profile?.level || 1;
  const currentXPInLevel = (profile?.poin || 0) % 100;
  const progressPercent = (currentXPInLevel / 100) * 100;
  const firstName = profile?.nama ? profile.nama.split(' ')[0] : "Siswa";

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 bg-slate-50/50 min-h-screen overflow-y-auto">
      {/* Header Sapaan */}
      <section className="px-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold text-slate-900">Halo, {firstName}! 👋</h2>
            <p className="text-sm text-muted-foreground font-medium">Semangat belajar hari ini.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
              <Search className="h-5 w-5 text-slate-400" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm relative">
              <Bell className="h-5 w-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
          </div>
        </div>
      </section>

      {/* Kartu Progress & Stats */}
      <section className="grid grid-cols-1 gap-4">
        <Card className="rounded-[2rem] border-none bg-gradient-to-br from-primary to-blue-700 text-white p-6 card-shadow relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">Level Saya</span>
                <h3 className="text-3xl font-headline font-bold">Level {currentLevel}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <Star className="h-8 w-8 text-yellow-300 fill-current" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span>{currentXPInLevel} / 100 XP</span>
                <span className="opacity-80">Level {currentLevel + 1}</span>
              </div>
              <Progress value={progressPercent} className="h-3 bg-white/20" />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-col items-center gap-1">
                <Flame className="h-5 w-5 text-orange-400 fill-current" />
                <span className="text-xs font-bold">Aktif</span>
                <span className="text-[9px] opacity-60 uppercase font-bold">Status</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="text-xs font-bold">{profile?.badges?.length || 0}</span>
                <span className="text-[9px] opacity-60 uppercase font-bold">Lencana</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold">{profile?.poin || 0}</span>
                <span className="text-[9px] opacity-60 uppercase font-bold">Total XP</span>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
        </Card>
      </section>

      {/* AI Recommendation Section (Optional) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 text-accent" />
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
              <Link href="/modules">
                <Button size="sm" className="w-full bg-accent hover:bg-accent/90 font-bold rounded-xl mt-2 h-10">
                  Terima Tantangan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-xs text-muted-foreground">Mulai belajar untuk melihat rekomendasi personal.</p>
            </div>
          )}
        </Card>
      </section>

      {/* Menu Cepat */}
      <section className="grid grid-cols-4 gap-4 px-1">
        {[
          { icon: Camera, label: "Scan AR", color: "bg-accent", href: "/ar-scan" },
          { icon: BookOpen, label: "Modul", color: "bg-blue-500", href: "/modules" },
          { icon: Zap, label: "Tantangan", color: "bg-orange-500", href: "/challenges" },
          { icon: Trophy, label: "Peringkat", color: "bg-yellow-500", href: "/leaderboard" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} href={item.href} className="flex flex-col items-center gap-2">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-90", item.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </section>

      {/* Lanjutkan Belajar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-lg text-slate-900">Materi Eksplorasi</h3>
          <Link href="/modules" className="text-xs font-bold text-primary">Lihat Semua</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
          {MODULES.map((mod) => {
            const isDone = profile?.completedModules?.includes(mod.id);
            return (
              <Link key={mod.id} href={`/modules/${mod.id}`} className="shrink-0 w-64">
                <Card className="rounded-[1.5rem] border-none overflow-hidden card-shadow bg-white active:scale-95 transition-transform">
                  <div className="relative h-32">
                    <img 
                      src={`https://picsum.photos/seed/${mod.img}/600/400`} 
                      alt={mod.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white", mod.color)}>
                        <mod.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{mod.tag}</span>
                    </div>
                    {isDone && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{mod.name}</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Progres</span>
                        <span>{isDone ? 100 : mod.progress}%</span>
                      </div>
                      <Progress value={isDone ? 100 : mod.progress} className="h-1.5" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Komik Digital Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-headline font-bold text-lg text-slate-900">📚 Komik Digital</h3>
          </div>
          <Link href="/komik" className="text-xs font-bold text-primary">Lihat Semua</Link>
        </div>
        <Link href="/komik">
          <Card className="rounded-3xl border-none bg-blue-50 p-6 card-shadow flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                <BookOpen className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">Petualangan Literasi</h4>
                <p className="text-xs text-slate-500 font-medium">Baca komik seru & dapatkan XP!</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight className="h-5 w-5" />
            </div>
          </Card>
        </Link>
      </section>
    </div>
  );
}
