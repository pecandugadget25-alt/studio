
'use client';

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Play, 
  Star, 
  CheckCircle2, 
  Loader2,
  Clock,
  AlertCircle,
  Trophy,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, increment, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const db = useFirestore();

  const [isFinishing, setIsFinishing] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const videoData = {
    title: "Mengenal Numerasi Melalui Budaya",
    description: "Eksplorasi bagaimana konsep matematika dasar seperti pola, simetri, dan geometri diterapkan dalam karya seni tradisional Indonesia.",
    duration: "4 Menit",
    xpReward: 10
  };

  useEffect(() => {
    // 1. Decode URL from parameters
    const decodedUrl = decodeURIComponent(id);
    
    // 2. Extract Video ID from Youtube URL
    const extractId = (url: string) => {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[7].length === 11) ? match[7] : null;
    };

    const vId = extractId(decodedUrl);
    if (vId) {
      setVideoId(vId);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [id]);

  const isAlreadyFinished = videoId ? profile?.completedVideos?.includes(videoId) : false;

  const handleClaimXP = async () => {
    if (!db || !user || !profile || isFinishing) return;
    
    if (isAlreadyFinished) {
      toast({
        title: "Sudah Selesai",
        description: "Kamu sudah mendapatkan XP dari video ini sebelumnya.",
      });
      router.push("/");
      return;
    }

    setIsFinishing(true);
    setProgress(100);

    const userRef = doc(db, "users", user.uid);
    const activityRef = collection(db, "activities");

    try {
      // 1. Update User Profile
      await updateDoc(userRef, {
        poin: increment(videoData.xpReward),
        completedVideos: arrayUnion(videoId)
      });

      // 2. Log Activity for Teacher
      await addDoc(activityRef, {
        userId: user.uid,
        userName: profile.nama,
        action: `menyelesaikan video: ${videoData.title}`,
        type: 'video',
        timestamp: serverTimestamp()
      });

      toast({
        title: "Selamat! +10 XP 🌟",
        description: `Kamu telah menyelesaikan materi video. Terus semangat!`,
      });

      router.push("/");
    } catch (e) {
      console.error(e);
      setIsFinishing(false);
      toast({
        variant: "destructive",
        title: "Gagal Klaim XP",
        description: "Terjadi kesalahan saat menyimpan progresmu.",
      });
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 max-w-[500px] mx-auto">
        <Card className="w-full border-none shadow-xl rounded-[2.5rem] p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-headline font-bold text-slate-900">Video Tidak Tersedia</h2>
            <p className="text-sm text-muted-foreground">Format link video tidak dikenali atau rusak.</p>
          </div>
          <Link href="/" className="block w-full">
            <Button className="w-full h-14 rounded-2xl font-bold">Kembali ke Beranda</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[500px] mx-auto pb-32">
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md">
        <Link href="/modules">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-sm tracking-wide uppercase text-primary">Video Learning</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-6 p-6 animate-in fade-in duration-700">
        {/* Title & Metadata */}
        <div className="space-y-2">
          <h2 className="text-2xl font-headline font-bold text-slate-900 leading-tight">
            {videoData.title}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{videoData.duration}</span>
            </div>
            {isAlreadyFinished && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3" /> Selesai
              </div>
            )}
          </div>
        </div>

        {/* Embedded Player */}
        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-black">
          <iframe
            src={embedUrl}
            title={videoData.title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Progress Bar (Manual Simulation) */}
        <div className="space-y-2">
           <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progres Menonton</span>
              <span className="text-xs font-bold text-primary">{isAlreadyFinished ? '100%' : `${progress}%`}</span>
           </div>
           <Progress value={isAlreadyFinished ? 100 : progress} className="h-2 bg-slate-100" />
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            {videoData.description}
          </p>
        </div>

        {/* Reward Section */}
        <Card className="bg-slate-50 border-none p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
           <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                    <Star className="h-6 w-6 fill-current" />
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hadiah Numerasi</p>
                    <p className="text-xl font-bold text-slate-900">+{videoData.xpReward} XP</p>
                 </div>
              </div>
              {isAlreadyFinished ? (
                 <Trophy className="h-8 w-8 text-yellow-500" />
              ) : (
                 <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              )}
           </div>
        </Card>

        {/* Action Controls */}
        <div className="space-y-4 pt-4">
          {!isAlreadyFinished ? (
            <Button 
              className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl gap-2 transition-transform active:scale-[0.98]"
              disabled={isFinishing}
              onClick={handleClaimXP}
            >
              {isFinishing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" /> Selesai & Klaim XP
                </span>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
               <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-green-700">Video telah diselesaikan. Materi ini sudah tercatat di progres belajarmu!</p>
               </div>
               <Link href="/modules" className="block">
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2">
                    ← Kembali ke Modul
                  </Button>
               </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
