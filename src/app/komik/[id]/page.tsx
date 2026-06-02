'use client';

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  ChevronRight, 
  Download,
  CheckCircle2,
  Loader2,
  BookOpen,
  ArrowLeft,
  Star,
  ExternalLink,
  Info,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

const COMIC_DATA: Record<string, { 
  title: string, 
  description: string,
  driveId: string, 
  moduleLink: string,
  image: string,
  moduleName: string,
  color: string
}> = {
  "batik": { 
    title: "Misteri Simetri Batik", 
    description: "Ikuti petualangan Adi menemukan rahasia matematika di balik motif batik parang yang indah.",
    driveId: "1ml4zlDAA-RS8CYnhG8BaUOdyL_nJffiw",
    moduleLink: "/modules/batik",
    image: "https://picsum.photos/seed/comic-batik/800/600",
    moduleName: "Batik Nusantara",
    color: "bg-orange-500"
  },
  "candi": { 
    title: "Petualangan di Candi Megah", 
    description: "Bantu Maya menghitung blok batu dan memahami bangun ruang di candi Borobudur.",
    driveId: "1dworgjt9gqSqNG_AQtCWbge9WANQ_fP-",
    moduleLink: "/modules/candi",
    image: "https://picsum.photos/seed/comic-candi/800/600",
    moduleName: "Candi Nusantara",
    color: "bg-primary"
  },
  "permainan": { 
    title: "Permainan Tradisional Nusantara", 
    description: "Eksplorasi strategi berhitung lewat permainan Congklak dan Engklek bersama teman-teman.",
    driveId: "1PP63HSHMdMMuSG6_rem9JhVg-aM2SaaS",
    moduleLink: "/modules/games",
    image: "https://picsum.photos/seed/comic-games/800/600",
    moduleName: "Permainan Nusantara",
    color: "bg-red-500"
  }
};

export default function ComicReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const db = useFirestore();

  const [isFinishing, setIsFinishing] = useState(false);
  const comic = COMIC_DATA[id as keyof typeof COMIC_DATA] || COMIC_DATA["batik"];
  const isRead = profile?.completedComics?.includes(id);

  const handleFinishReading = async () => {
    if (!db || !user) return;
    
    if (isRead) {
      router.push("/komik");
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
        title: "Keren! Kamu Selesai Membaca 🎉",
        description: "Kamu mendapatkan +5 XP. Ayo baca komik lainnya!",
      });
      router.push("/komik");
    } catch (error) {
      console.error("Gagal menyimpan progress komik", error);
      setIsFinishing(false);
      toast({
        variant: "destructive",
        title: "Gagal menyimpan",
        description: "Terjadi kesalahan saat menyimpan progresmu.",
      });
    }
  };

  const readUrl = `https://drive.google.com/file/d/${comic.driveId}/view`;
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${comic.driveId}`;

  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center justify-between px-6 max-w-[500px] mx-auto">
        <Link href="/komik">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-base truncate max-w-[200px]">{comic.title}</h1>
        <div className="w-10" />
      </header>

      <main className="pt-20 px-6 space-y-8">
        <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
          <Image 
            src={comic.image} 
            alt={comic.title} 
            fill 
            className="object-cover"
            data-ai-hint="comic cover detail"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
            <div className="space-y-2">
              <span className={cn(comic.color, "text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full")}>
                {comic.moduleName}
              </span>
              <h2 className="text-white text-2xl font-headline font-bold leading-tight">{comic.title}</h2>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none bg-slate-50 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-600 leading-relaxed font-medium">
              {comic.description}
            </p>
            <div className="flex items-center gap-2 text-accent font-bold mt-4 text-sm">
              <Star className="h-5 w-5 fill-current" />
              <span>Selesaikan untuk mendapatkan +5 XP</span>
            </div>
          </Card>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900">Petunjuk Belajar:</p>
              <p className="text-[11px] text-slate-500 leading-normal">
                Klik <strong>Baca Komik</strong> untuk membuka di tab baru. Setelah selesai, kembali ke sini dan klik <strong>Sudah Dibaca</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <a href={readUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold gap-2 shadow-sm">
                <ExternalLink className="h-4 w-4" /> Baca Komik
              </Button>
            </a>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold gap-2 shadow-sm">
                <Download className="h-4 w-4" /> PDF
              </Button>
            </a>
          </div>

          <Button 
            className={cn(
              "w-full h-16 text-lg font-bold rounded-[1.5rem] shadow-xl transition-all",
              isRead ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
            )}
            onClick={handleFinishReading}
            disabled={isFinishing}
          >
            {isFinishing ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : isRead ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" /> Selesai Dibaca
              </span>
            ) : (
              "Saya Sudah Membaca"
            )}
          </Button>

          <div className="text-center pt-2">
            <Link href={comic.moduleLink}>
              <Button variant="link" className="text-primary font-bold gap-2">
                Pelajari Materi di Modul <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
