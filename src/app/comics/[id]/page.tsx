
'use client';

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut,
  Trophy,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const COMIC_DATA: Record<string, { title: string, driveId: string, moduleLink: string }> = {
  "komik-1": { 
    title: "Misteri Simetri Batik", 
    driveId: "1ml4zlDAA-RS8CYnhG8BaUOdyL_nJffiw",
    moduleLink: "/modules/batik"
  },
  "komik-2": { 
    title: "Petualangan di Candi Megah", 
    driveId: "1dworgjt9gqSqNG_AQtCWbge9WANQ_fP-",
    moduleLink: "/modules/candi"
  },
  "komik-3": { 
    title: "Rahasia Geometri Masjid", 
    driveId: "1PP63HSHMdMMuSG6_rem9JhVg-aM2SaaS",
    moduleLink: "/modules/masjid"
  }
};

export default function ComicReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const db = useFirestore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const comic = COMIC_DATA[id] || COMIC_DATA["komik-1"];

  const handleFinishReading = async () => {
    if (!db || !user) return;
    
    // Jika sudah pernah baca, tidak dapat XP lagi tapi tetap bisa selesai
    if (profile?.completedComics?.includes(id)) {
      router.push("/comics");
      return;
    }

    setIsFinishing(true);
    const userRef = doc(db, "users", user.uid);
    const updateData = {
      poin: increment(5),
      completedComics: arrayUnion(id)
    };

    try {
      await updateDoc(userRef, updateData);
      toast({
        title: "Komik Selesai! 🎉",
        description: "Kamu mendapatkan +5 XP. Teruslah membaca!",
      });
      router.push("/comics");
    } catch (error) {
      console.error("Gagal menyimpan progress komik", error);
      setIsFinishing(false);
    }
  };

  const drivePreviewUrl = `https://drive.google.com/file/d/${comic.driveId}/preview`;

  return (
    <div className={`fixed inset-0 bg-slate-900 flex flex-col z-[100] ${isFullscreen ? 'p-0' : 'p-0'}`}>
      {/* Header Controls */}
      <div className="bg-slate-900/80 backdrop-blur-md h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/comics">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <X className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-white font-bold truncate max-w-[200px] md:max-w-md">{comic.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10 hidden md:flex"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 font-bold px-6 rounded-full"
            onClick={handleFinishReading}
            disabled={isFinishing}
          >
            {isFinishing ? <Loader2 className="animate-spin h-4 w-4" /> : "Selesai Baca"}
          </Button>
        </div>
      </div>

      {/* Comic Viewer Content */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <iframe 
          src={drivePreviewUrl} 
          className="w-full h-full border-none"
          allow="autoplay"
        />
        
        {/* Navigation Overlay Hints */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/60 text-xs">
          Gunakan kontrol di dalam viewer untuk zoom dan navigasi
        </div>
      </div>

      {/* Footer / Context Link */}
      {!isFullscreen && (
        <div className="bg-white p-4 flex items-center justify-center border-t">
          <Link href={comic.moduleLink}>
            <Button variant="link" className="text-primary font-bold gap-2">
              Buka Modul Terkait <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
