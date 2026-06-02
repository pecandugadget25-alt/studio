
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Flame, 
  BookOpen, 
  Star, 
  ArrowRight, 
  Camera, 
  MapPin, 
  Lightbulb,
  CheckCircle2,
  Clock,
  LogOut,
  Loader2,
  Castle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useUser, useFirebase } from "@/firebase";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";

export default function StudentDashboard() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { user, profile, loading: authLoading } = useUser();
  const [recommendations, setRecommendations] = useState<PersonalizedLearningRecommendationOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    if (profile) {
      async function fetchRecommendations() {
        setAiLoading(true);
        try {
          const result = await personalizedLearningRecommendation({
            studentName: profile?.nama || "Siswa",
            recentQuizResults: [
              { moduleName: "Batik Simetri", score: 75, difficulty: "sedang" },
              { moduleName: "Geometri Candi", score: 45, difficulty: "sedang" }
            ],
            completedModules: profile.completedModules || [],
            availableModules: ["Geometri Candi", "Masjid Al Akbar", "Permainan Tradisional"],
            availableBadges: ["Ahli Geometri Batik", "Penjaga Warisan"]
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
  }, [profile?.poin, profile?.completedModules]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F5]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isBatikDone = profile.completedModules?.includes("batik_nusantara");
  const isCandiDone = profile.completedModules?.includes("candi_nusantara");

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-20">
      <nav className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-headline font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs">EA</div>
            ETHNO-ARITH
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-full text-accent font-bold text-sm">
              <Flame className="h-4 w-4 fill-current" />
              <span>3 Hari</span>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-sm">
              <Star className="h-4 w-4 fill-current" />
              <span>{profile.poin} XP</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border overflow-hidden">
            <img src={`https://picsum.photos/seed/${profile.uid}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="relative z-10 max-w-lg">
                <h1 className="text-3xl font-headline font-bold mb-2">Selamat Datang, {profile.nama.split(' ')[0]}! 👋</h1>
                <p className="opacity-90 mb-6">Kamu telah mengumpulkan {profile.poin} XP. Selesaikan modul candi untuk membuka lencana Arsitek Muda!</p>
                <div className="flex gap-4">
                  <Link href="/modules/batik">
                    <Button className="bg-white text-primary hover:bg-slate-100 font-bold px-6">Lanjutkan Belajar</Button>
                  </Link>
                  <Link href="/ar-scan">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-6">
                      <Camera className="mr-2 h-4 w-4" /> Scan AR
                    </Button>
                  </Link>
                </div>
              </div>
              <Trophy className="absolute top-8 right-8 h-32 w-32 text-white/10 rotate-12" />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-headline font-bold">Rekomendasi Belajarmu</h2>
              </div>
              
              <Card className="border-accent/30 bg-accent/5 overflow-hidden">
                {aiLoading ? (
                  <CardContent className="py-12 flex justify-center">
                    <Loader2 className="animate-spin h-8 w-8 text-accent" />
                  </CardContent>
                ) : recommendations ? (
                  <div className="grid md:grid-cols-2">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-accent uppercase tracking-wider">Tantangan Berikutnya</p>
                        <h3 className="text-lg font-bold">{recommendations.nextChallenge}</h3>
                      </div>
                      <p className="text-sm italic text-muted-foreground">"{recommendations.motivationMessage}"</p>
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

            <section className="space-y-4">
              <h2 className="text-xl font-headline font-bold">Lanjutkan Modul</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { id: 'batik', name: 'Batik Nusantara', progress: isBatikDone ? 100 : 0, icon: MapPin, color: 'bg-orange-500' },
                  { id: 'candi', name: 'Candi Nusantara', progress: isCandiDone ? 100 : 0, icon: Castle, color: 'bg-primary' },
                ].map((mod) => (
                  <Card key={mod.id} className="hover:shadow-md transition-shadow group">
                    <Link href={`/modules/${mod.id}`} className="block">
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
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Progress Level</CardTitle>
                <CardDescription>Level {profile.level}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                      {profile.poin} XP
                    </span>
                    <span className="text-xs font-semibold text-primary">Target 1000 XP</span>
                  </div>
                  <Progress value={(profile.poin / 1000) * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Badge Koleksi</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary font-bold">Lihat Semua</Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {isBatikDone && (
                    <div className="p-4 rounded-2xl bg-orange-100 text-orange-600 flex flex-col items-center gap-2">
                      <MapPin className="h-8 w-8" />
                      <span className="text-[10px] font-bold text-center uppercase">Ahli Batik</span>
                    </div>
                  )}
                  {isCandiDone && (
                    <div className="p-4 rounded-2xl bg-blue-100 text-blue-600 flex flex-col items-center gap-2">
                      <Castle className="h-8 w-8" />
                      <span className="text-[10px] font-bold text-center uppercase">Arsitek Muda</span>
                    </div>
                  )}
                  {!isBatikDone && !isCandiDone && (
                    <div className="p-4 rounded-2xl bg-muted/30 border-2 border-dashed flex flex-col items-center justify-center opacity-40">
                      <Clock className="h-8 w-8 mb-1" />
                      <span className="text-[10px] font-bold">Terkunci</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
