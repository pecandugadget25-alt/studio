
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { 
  Trophy, 
  Star, 
  ArrowRight, 
  MapPin, 
  CheckCircle2,
  LogOut,
  Loader2,
  Castle,
  Dices,
  Landmark,
  Medal,
  TrendingUp,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useUser, useFirebase } from "@/firebase";
import { personalizedLearningRecommendation, type PersonalizedLearningRecommendationOutput } from "@/ai/flows/personalized-learning-recommendation";

const BADGE_CONFIG = {
  "Ahli Geometri Batik": { icon: MapPin, color: "bg-orange-100 text-orange-600", label: "Ahli Batik" },
  "Penjelajah Candi Nusantara": { icon: Castle, color: "bg-blue-100 text-blue-600", label: "Arsitek Candi" },
  "Ahli Matematika Masjid": { icon: Landmark, color: "bg-emerald-100 text-emerald-600", label: "Wali Masjid" },
  "Juara Numerasi": { icon: Dices, color: "bg-red-100 text-red-600", label: "Jago Main" },
  "Penjaga Budaya Nusantara": { icon: Trophy, color: "bg-yellow-100 text-yellow-600", label: "Penjaga Budaya" }
};

const MODULES = [
  { id: 'batik', name: 'Batik Nusantara', icon: MapPin, color: 'bg-orange-500', tag: 'Simetri' },
  { id: 'candi', name: 'Candi Nusantara', icon: Castle, color: 'bg-primary', tag: 'Geometri' },
  { id: 'masjid', name: 'Masjid Al Akbar', icon: Landmark, color: 'bg-emerald-600', tag: 'Numerasi' },
  { id: 'games', name: 'Permainan Tradisional', icon: Dices, color: 'bg-red-500', tag: 'Logika' },
];

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
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      async function fetchRecommendations() {
        setAiLoading(true);
        try {
          const result = await personalizedLearningRecommendation({
            studentName: profile?.nama || "Siswa",
            recentQuizResults: [
              { moduleName: "Batik Simetri", score: 80, difficulty: "sedang" }
            ],
            completedModules: profile.completedModules || [],
            availableModules: MODULES.map(m => m.name),
            availableBadges: Object.keys(BADGE_CONFIG)
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

  const currentLevel = profile.level || 1;
  const xpForNextLevel = 100;
  const currentXPInLevel = profile.poin % 100;
  const progressPercent = (currentXPInLevel / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-20">
      <nav className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-headline font-bold text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs">EA</div>
            <span className="hidden sm:inline">ETHNO-ARITH</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/leaderboard" className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 font-bold text-xs sm:text-sm">
            <Trophy className="h-4 w-4" />
            <span className="hidden md:inline">Leaderboard</span>
          </Link>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-xs sm:text-sm">
            <Star className="h-4 w-4 fill-current" />
            <span>{profile.poin} XP</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border overflow-hidden">
            <img src={`https://picsum.photos/seed/${profile.uid}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-primary rounded-3xl p-6 sm:p-8 text-primary-foreground relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="relative z-10 max-w-lg">
                <h1 className="text-2xl sm:text-3xl font-headline font-bold mb-2">Semangat Belajar, {profile.nama.split(' ')[0]}! 🚀</h1>
                <p className="text-sm sm:text-base opacity-90 mb-6">Kamu berada di Level {currentLevel}. Kumpulkan {xpForNextLevel - currentXPInLevel} XP lagi untuk naik level!</p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/modules/batik">
                    <Button className="bg-white text-primary hover:bg-slate-100 font-bold px-6">Mulai Belajar</Button>
                  </Link>
                  <Link href="/comics">
                    <Button variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700 font-bold px-6">
                      <BookOpen className="mr-2 h-4 w-4" /> Baca Komik
                    </Button>
                  </Link>
                </div>
              </div>
              <Medal className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10 rotate-12" />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <h2 className="text-xl font-headline font-bold">Rekomendasi Pintar</h2>
              </div>
              
              <Card className="border-accent/30 bg-accent/5 overflow-hidden rounded-3xl">
                {aiLoading ? (
                  <CardContent className="py-12 flex justify-center">
                    <Loader2 className="animate-spin h-8 w-8 text-accent" />
                  </CardContent>
                ) : recommendations ? (
                  <div className="grid md:grid-cols-2">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-accent uppercase tracking-wider">Tantangan AI</p>
                        <h3 className="text-lg font-bold">{recommendations.nextChallenge}</h3>
                      </div>
                      <p className="text-sm italic text-muted-foreground">"{recommendations.motivationMessage}"</p>
                    </CardContent>
                    <div className="bg-white/50 p-6 flex flex-col justify-center border-l border-accent/20">
                      <p className="text-sm font-bold mb-3">Target Lencana Berikutnya:</p>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border">
                         <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                           <Star className="h-5 w-5" />
                         </div>
                         <span className="text-sm font-bold">{recommendations.suggestedBadge}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-headline font-bold">Komik Petualangan</h2>
                </div>
                <Link href="/comics">
                  <Button variant="link" className="text-primary font-bold">Lihat Semua</Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'komik-1', title: 'Misteri Batik', color: 'bg-orange-500', img: 'comic-batik' },
                  { id: 'komik-2', title: 'Candi Megah', color: 'bg-primary', img: 'comic-candi' },
                  { id: 'komik-3', title: 'Geometri Masjid', color: 'bg-emerald-600', img: 'comic-mosque' }
                ].map((comic) => (
                  <Link key={comic.id} href={`/comics/${comic.id}`}>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer shadow-md">
                      <img 
                        src={`https://picsum.photos/seed/${comic.img}/400/600`} 
                        alt={comic.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                        <p className="text-white text-[10px] font-bold uppercase tracking-wider mb-1">Budaya</p>
                        <p className="text-white text-xs sm:text-sm font-bold truncate">{comic.title}</p>
                        {profile.completedComics?.includes(comic.id) && (
                          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-headline font-bold">Modul Budaya Nusantara</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {MODULES.map((mod) => (
                  <Card key={mod.id} className="hover:shadow-md transition-shadow group overflow-hidden rounded-3xl border-none shadow-sm">
                    <Link href={`/modules/${mod.id}`} className="block">
                      <CardContent className="p-0 flex items-stretch h-32">
                        <div className={`w-24 ${mod.color} flex items-center justify-center text-white`}>
                          <mod.icon className="h-10 w-10" />
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between">
                          <div>
                            <UIBadge variant="outline" className="text-[10px] mb-1 font-bold">{mod.tag}</UIBadge>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-base sm:text-lg">{mod.name}</h4>
                              {profile.completedModules?.includes(mod.id) && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-primary font-bold">
                            Mulai Belajar <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-3xl border-none shadow-lg overflow-hidden">
              <div className="h-2 bg-accent" />
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <CardTitle className="text-lg">Progress Level</CardTitle>
                  <UIBadge className="bg-accent text-accent-foreground">Level {currentLevel}</UIBadge>
                </div>
                <CardDescription>Kumpulkan XP untuk naik ke level {currentLevel + 1}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between text-xs font-bold">
                    <span>{profile.poin} XP</span>
                    <span>{(currentLevel * 100)} XP</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                  Total XP kamu saat ini adalah {profile.poin}. Semangat!
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Koleksi Lencana</CardTitle>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(BADGE_CONFIG).map(([name, config]) => {
                    const isOwned = profile.badges?.includes(name);
                    return (
                      <div 
                        key={name} 
                        className={`p-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${
                          isOwned 
                          ? `${config.color} border-transparent scale-100` 
                          : 'bg-muted/30 border-dashed border-muted grayscale opacity-40 scale-95'
                        }`}
                      >
                        <config.icon className="h-8 w-8" />
                        <span className="text-[10px] font-bold text-center leading-tight uppercase">
                          {isOwned ? config.label : 'Terkunci'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {(!profile.badges || profile.badges.length === 0) && (
                  <p className="text-center text-xs text-muted-foreground mt-4 italic">
                    Selesaikan kuis akhir modul untuk mendapatkan lencana pertamamu!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
