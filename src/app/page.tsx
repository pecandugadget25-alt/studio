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
  Flame,
  Award,
  Bell,
  Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";
import Image from "next/image";
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
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentLevel = profile.level || 1;
  const currentXPInLevel = profile.poin % 100;
  const progressPercent = (currentXPInLevel / 100) * 100;

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header Sapaan */}
      <section className="px-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold text-slate-900">Halo, {profile.nama.split(' ')[0]}! 👋</h2>
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
                <span className="text-xs font-bold">3 Hari</span>
                <span className="text-[9px] opacity-60 uppercase font-bold">Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Award className="h-5 w-5 text-yellow-400" />
                <span className="text-xs font-bold">{profile.badges?.length || 0}</span>
                <span className="text-[9px] opacity-60 uppercase font-bold">Badges</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold">TOP 10</span>
                <span className="text-[9px] opacity-60 uppercase font-bold">Rank</span>
              </div>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
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

      {/* AI Recommendation Card */}
      <section>
        <Card className="rounded-3xl border-none bg-orange-50 overflow-hidden relative border border-orange-100/50">
          <div className="p-5 flex items-start gap-4">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900">
                {aiLoading ? "Sedang memikirkan tantangan..." : (recommendations?.nextChallenge || "Siap tantangan baru?")}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                "{aiLoading ? "Analisis kemajuan..." : (recommendations?.motivationMessage || "Terus asah kemampuan numerasimu!")}"
              </p>
            </div>
          </div>
          <Button variant="ghost" className="w-full h-10 bg-orange-100/50 text-accent font-bold text-xs rounded-none border-t border-orange-100">
            Terima Tantangan <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </Card>
      </section>

      {/* Lanjutkan Belajar - Horizontal Scroll */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-lg text-slate-900">Lanjutkan Belajar</h3>
          <Link href="/modules" className="text-xs font-bold text-primary">Lihat Semua</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
          {MODULES.map((mod) => (
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
                </div>
                <div className="p-4 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{mod.name}</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Progres</span>
                      <span>{mod.progress}%</span>
                    </div>
                    <Progress value={mod.progress} className="h-1.5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Aktivitas Terbaru */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1">Aktivitas Terakhir</h3>
        <Card className="rounded-3xl border-none bg-white p-5 card-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">Kuis Batik Simetri</h4>
              <p className="text-xs text-slate-500">Selesai • 80/100 Poin</p>
            </div>
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-bold text-primary">+20 XP</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

import { Zap, Trophy as TrophyIcon } from "lucide-react";
