
'use client';

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  X, 
  ChevronRight, 
  Download,
  CheckCircle2,
  Loader2,
  BookOpen,
  ArrowLeft,
  Star
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const COMIC_DATA: Record<string, { 
  title: string, 
  description: string,
  driveId: string, 
  moduleLink: string,
  image: string
}> = {
  "komik-1": { 
    title: "Misteri Simetri Batik", 
    description: "Ikuti petualangan Adi menemukan rahasia matematika di balik motif batik parang yang indah.",
    driveId: "1ml4zlDAA-RS8CYnhG8BaUOdyL_nJffiw",
    moduleLink: "/modules/batik",
    image: "https://picsum.photos/seed/comic-batik/800/600"
  },
  "komik-2": { 
    title: "Petualangan di Candi Megah", 
    description: "Bantu Maya menghitung blok batu dan memahami bangun ruang di candi Borobudur.",
    driveId: "1dworgjt9gqSqNG_AQtCWbge9WANQ_fP-",
    moduleLink: "/modules/candi",
    image: "https://picsum.photos/seed/comic-candi/800/600"
  },
  "komik-3": { 
    title: "Rahasia Geometri Masjid", 
    description: "Eksplorasi keindahan kubah dan menara masjid dengan konsep geometri yang seru.",
    driveId: "1PP63HSHMdMMuSG6_rem9JhVg-aM2SaaS",
    moduleLink: "/modules/masjid",
    image: "https://picsum.photos/seed/comic-mosque/800/600"
  }
};

export default function ComicReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile } = useUser();
  const db = useFirestore();

  const [isFinishing, setIsFinishing] = useState(false);
  const comic = COMIC_DATA[id] || COMIC_DATA["komik-1"];
  const isRead = profile?.completedComics?.includes(id);

  const handleFinishReading = async () => {
    if (!db || !user) return;
    
    if (isRead) {
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
        title: "Keren! Kamu Selesai Membaca 🎉",
        description: "Kamu mendapatkan +5 XP. Ayo baca komik lainnya!",
      });
      router.push("/comics");
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

  const downloadUrl = `https://drive.google.com/file/d/${comic.driveId}/view?usp=sharing`;

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col">
      {/* Simple Header */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <Link href="/comics">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-lg hidden md:block">Petualangan Literasi</h1>
        <div className="w-10 md:hidden" />
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 max-w-2xl">
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="relative aspect-video">
            <Image 
              src={comic.image} 
              alt={comic.title} 
              fill 
              className="object-cover"
              data-ai-hint="comic cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h2 className="text-white text-2xl font-headline font-bold">{comic.title}</h2>
            </div>
          </div>
          
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {comic.description}
              </p>
              <div className="flex items-center gap-2 text-accent font-bold">
                <Star className="h-5 w-5 fill-current" />
                <span>+5 XP setelah selesai membaca</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-primary mt-1" />
              <div className="text-sm">
                <p className="font-bold">Cara Membaca:</p>
                <ol className="list-decimal list-inside text-muted-foreground">
                  <li>Klik tombol unduh di bawah ini</li>
                  <li>Baca komik sampai selesai</li>
                  <li>Kembali ke sini dan klik "Saya Sudah Membaca"</li>
                </ol>
              </div>
            </div>

            <div className="grid gap-4 pt-4">
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl border-2 gap-2">
                  <Download className="h-5 w-5" /> Unduh Komik
                </Button>
              </a>
              
              <Button 
                className={`w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-all ${
                  isRead ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary/90"
                }`}
                onClick={handleFinishReading}
                disabled={isFinishing}
              >
                {isFinishing ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : isRead ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Sudah Dibaca
                  </span>
                ) : (
                  "Saya Sudah Membaca"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href={comic.moduleLink}>
            <Button variant="link" className="text-primary font-bold gap-2">
              Pelajari Materi Terkait di Modul <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
