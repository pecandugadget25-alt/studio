
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Flame, 
  BookOpen, 
  Gamepad2, 
  Star, 
  ArrowRight, 
  Camera, 
  MapPin, 
  Lightbulb,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";

export default function StudentDashboard() {
  const [recommendations, setRecommendations] = useState<PersonalizedLearningRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const result = await personalizedLearningRecommendation({
          studentName: "Budi Santoso",
          recentQuizResults: [
            { moduleName: "Batik Simetri", score: 75, difficulty: "sedang" },
            { moduleName: "Geometri Candi", score: 45, difficulty: "sedang" }
          ],
          completedModules: ["Pengenalan Batik"],
          availableModules: ["Geometri Candi", "Masjid Al Akbar", "Permainan Tradisional"],
          availableBadges: ["Ahli Geometri Batik", "Penjaga Warisan"]
        });
        setRecommendations(result);
      } catch (error) {
        console.error("Failed to load AI recommendations", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-20">
      {/* Top Navbar */}
      <nav className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-headline font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs">EA</div>
            ETHNO-ARITH
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-accent font-bold text-sm">
            <Flame className="h-4 w-4 fill-current" />
            <span>3 Hari</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-sm">
            <Star className="h-4 w-4 fill-current" />
            <span>1,250 XP</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200 border overflow-hidden">
            <img src="https://picsum.photos/seed/budi/100/100" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Welcome */}
            <section className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="relative z-10 max-w-lg">
                <h1 className="text-3xl font-headline font-bold mb-2">Selamat Datang, Budi! 👋</h1>
                <p className="opacity-90 mb-6">Kamu hampir mencapai Level 5! Selesaikan 1 tantangan lagi untuk membuka badge 'Penjelajah Candi'.</p>
                <div className="flex gap-4">
                  <Link href="/modules/candi">
                    <Button className="bg-white text-primary hover:bg-slate-100 font-bold px-6">Lanjutkan Belajar</Button>
                  </Link>
                  <Link href="/ar-scan">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-6">
                      <Camera className="mr-2 h-4 w-4" /> Scan AR
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 -mr-12" />
              <Trophy className="absolute top-8 right-8 h-32 w-32 text-white/10 rotate-12" />
            </section>

            {/* AI Recommendation Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-xl font-headline font-bold">Rekomendasi Belajarmu</h2>
              </div>
              
              <Card className="border-accent/30 bg-accent/5 overflow-hidden">
                {loading ? (
                  <CardContent className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                  </CardContent>
                ) : recommendations ? (
                  <div className="grid md:grid-cols-2">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-accent uppercase tracking-wider">Tantangan Berikutnya</p>
                        <h3 className="text-lg font-bold">{recommendations.nextChallenge}</h3>
                      </div>
                      <p className="text-sm italic text-muted-foreground">"{recommendations.motivationMessage}"</p>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground">TARGET BADGE:</p>
                        <Badge className="bg-accent hover:bg-accent/90">{recommendations.suggestedBadge}</Badge>
                      </div>
                    </CardContent>
                    <div className="bg-white/50 p-6 flex flex-col justify-center border-l border-accent/20">
                      <p className="text-sm font-bold mb-3">Area Peningkatan:</p>
                      <ul className="space-y-2">
                        {recommendations.areasForImprovement.map((area, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary" /> {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </Card>
            </section>

            {/* Modules Grid */}
            <section className="space-y-4">
              <h2 className="text-xl font-headline font-bold">Lanjutkan Modul</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { id: 'batik', name: 'Batik Nusantara', progress: 75, icon: MapPin, color: 'bg-orange-500' },
                  { id: 'candi', name: 'Candi Nusantara', progress: 30, icon: BookOpen, color: 'bg-primary' },
                  { id: 'masjid', name: 'Masjid Al Akbar', progress: 0, icon: Flame, color: 'bg-teal-500' },
                  { id: 'games', name: 'Permainan Tradisional', progress: 0, icon: Gamepad2, color: 'bg-amber-500' },
                ].map((mod) => (
                  <Card key={mod.id} className="hover:shadow-md transition-shadow group cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 ${mod.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        <mod.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold">{mod.name}</h4>
                        <div className="flex items-center gap-3">
                          <Progress value={mod.progress} className="h-2" />
                          <span className="text-xs font-bold text-muted-foreground">{mod.progress}%</span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* XP and Levels Card */}
            <Card className="rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Progress Level</CardTitle>
                <CardDescription>Level 4 (Pejuang Budaya)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                        Level 4
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary">
                        800/1000 XP
                      </span>
                    </div>
                  </div>
                  <Progress value={80} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-2xl bg-[#FAF7F5] border">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-muted-foreground uppercase">Kuis Selesai</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF7F5] border">
                    <p className="text-2xl font-bold text-accent">5</p>
                    <p className="text-xs text-muted-foreground uppercase">Badge Koleksi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges Collection */}
            <Card className="rounded-3xl border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Badge Koleksi</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary font-bold">Lihat Semua</Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'Ahli Geometri Batik', color: 'bg-orange-100 text-orange-600' },
                    { name: 'Penjaga Warisan', color: 'bg-teal-100 text-teal-600' },
                    { name: 'Juara Numerasi', color: 'bg-primary/10 text-primary' },
                  ].map((badge, i) => (
                    <div key={i} className={`p-4 rounded-2xl ${badge.color} flex flex-col items-center gap-2 group cursor-help`}>
                      <Trophy className="h-8 w-8 transition-transform group-hover:scale-110" />
                      <span className="text-[10px] font-bold text-center uppercase leading-tight">{badge.name}</span>
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl bg-muted/30 border-2 border-dashed flex flex-col items-center justify-center opacity-40">
                    <Clock className="h-8 w-8 mb-1" />
                    <span className="text-[10px] font-bold">Terkunci</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Challenge */}
            <Card className="rounded-3xl border-none shadow-lg bg-accent text-accent-foreground overflow-hidden relative">
              <CardContent className="p-6">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    <h3 className="font-headline font-bold">Tantangan Harian</h3>
                  </div>
                  <p className="text-sm opacity-90">Selesaikan kuis 'Pola Batik Mega Mendung' dengan nilai sempurna hari ini!</p>
                  <Button variant="secondary" className="w-full font-bold">Mulai Tantangan (+50 XP)</Button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Flame className="h-32 w-32 rotate-12" />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
