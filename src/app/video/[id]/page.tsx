'use client';

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Play, 
  Star, 
  CheckCircle2, 
  Loader2,
  Clock,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  const [isFinishing, setIsFinishing] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Data Video Structure
  const videoData = {
    title: "Mengenal Numerasi Melalui Budaya",
    description: "Video ini menjelaskan bagaimana prinsip matematika dasar diaplikasikan dalam kehidupan sehari-hari dan karya seni tradisional Indonesia.",
    duration: "4 Menit",
    xpReward: 5
  };

  useEffect(() => {
    // 1. Decode URL from parameters
    const decodedUrl = decodeURIComponent(id);
    
    // 2. Extract Video ID from Youtube URL (supports youtu.be and youtube.com)
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

  const handleClaimXP = async () => {
    if (!db || !user || isFinishing) return;
    setIsFinishing(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        poin: increment(videoData.xpReward)
      });
      toast({
        title: "XP Bertambah! 🌟",
        description: `Selamat! Kamu mendapatkan +${videoData.xpReward} XP setelah menonton video.`,
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

  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
    : "https://picsum.photos/seed/video-placeholder/800/450";

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[500px] mx-auto pb-32">
      <header className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 border-b bg-white/80 backdrop-blur-md">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-sm tracking-wide uppercase text-primary">Video Pembelajaran</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-8 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Materi Inti
            </div>
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white group">
          <img 
            src={thumbnailUrl} 
            alt={videoData.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
             <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl text-primary transform transition-all active:scale-90 hover:bg-white">
                  <Play className="h-8 w-8 fill-current translate-x-0.5" />
                </div>
             </a>
          </div>
        </div>

        {/* Description */}
        <Card className="border-none bg-slate-50 rounded-[1.5rem] p-6">
          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            {videoData.description}
          </p>
        </Card>

        {/* Reward Card */}
        <Card className="bg-white border-2 border-primary/10 p-6 rounded-[2rem] shadow-sm">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                    <Star className="h-6 w-6 fill-current" />
                 </div>
                 <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hadiah Belajar</p>
                    <p className="text-xl font-bold text-slate-900">+{videoData.xpReward} XP Numerasi</p>
                 </div>
              </div>
              <CheckCircle2 className="h-6 w-6 text-emerald-500 opacity-20" />
           </div>
        </Card>

        {/* Action Button */}
        <div className="space-y-4">
          <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl gap-2 transition-transform active:scale-[0.98]">
              <Play className="h-5 w-5 fill-current" /> Tonton Video
            </Button>
          </a>
          
          <Button 
            variant="outline"
            className="w-full h-14 rounded-2xl text-sm font-bold border-2 transition-all hover:bg-slate-50"
            disabled={isFinishing}
            onClick={handleClaimXP}
          >
            {isFinishing ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              "Selesai & Klaim XP"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
