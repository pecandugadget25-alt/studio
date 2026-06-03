'use client';

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Star, 
  CheckCircle2, 
  Loader2,
  Tv
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const db = useFirestore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Simulation of video playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => Math.min(p + 1, 100));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handleFinish = async () => {
    if (!db || !user || isFinishing) return;
    setIsFinishing(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        poin: increment(5)
      });
      toast({
        title: "XP Bertambah! 🌟",
        description: "Selamat! Kamu mendapatkan +5 XP setelah menonton video.",
      });
      router.push("/");
    } catch (e) {
      console.error(e);
      setIsFinishing(false);
    }
  };

  const isCompleted = progress === 100;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col max-w-[500px] mx-auto">
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-white font-bold text-sm truncate max-w-[200px] uppercase tracking-wider">Video Pembelajaran</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col">
        {/* Video Placeholder Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/video-thumb/800/450')] bg-cover bg-center opacity-40" />
          
          {!isPlaying && !isCompleted && (
            <Button 
              size="icon" 
              className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 scale-110 shadow-2xl z-10"
              onClick={() => setIsPlaying(true)}
            >
              <Play className="h-10 w-10 fill-current" />
            </Button>
          )}

          {isCompleted && (
            <div className="text-center space-y-4 z-10">
               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl animate-in zoom-in">
                 <CheckCircle2 className="h-10 w-10 text-white" />
               </div>
               <p className="text-white font-bold text-lg">Selesai Menonton!</p>
            </div>
          )}

          {/* Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-center px-6 gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <Volume2 className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-red-500/20 px-2 py-1 rounded text-red-500 text-[10px] font-bold uppercase">Materi Inti</div>
              <div className="text-white/40 text-[10px] font-bold uppercase">4:20 Menit</div>
            </div>
            <h2 className="text-2xl font-headline font-bold text-white leading-tight">Mengenal Numerasi Melalui Budaya: {id.replace('_', ' ')}</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Video ini menjelaskan bagaimana prinsip matematika dasar diaplikasikan dalam kehidupan sehari-hari dan karya seni tradisional Indonesia.
            </p>
          </div>

          <Card className="bg-white/5 border-white/10 p-6 rounded-3xl space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                      <Star className="h-5 w-5 fill-current" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-white/40 uppercase">Hadiah Menonton</p>
                      <p className="text-lg font-bold text-white">+5 XP Numerasi</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-white/40 uppercase">Progres</p>
                   <p className="text-lg font-bold text-primary">{progress}%</p>
                </div>
             </div>
             <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
             </div>
          </Card>

          <Button 
            className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl"
            disabled={!isCompleted || isFinishing}
            onClick={handleFinish}
          >
            {isFinishing ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isCompleted ? (
              "Ambil XP & Kembali"
            ) : (
              "Selesaikan Video"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}