
'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Star, CheckCircle2, Download, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import Image from "next/image";
import { cn } from "@/lib/utils";

const COMICS = [
  {
    id: "batik",
    title: "Misteri Simetri Batik",
    description: "Adi menemukan rahasia matematika di balik motif batik parang yang indah.",
    module: "Batik Nusantara",
    color: "bg-orange-500",
    image: "https://picsum.photos/seed/comic-batik/400/600",
    hint: "batik comic"
  },
  {
    id: "candi",
    title: "Petualangan di Candi Megah",
    description: "Bantu Maya menghitung blok batu dan memahami bangun ruang di candi Borobudur.",
    module: "Candi Nusantara",
    color: "bg-primary",
    image: "https://picsum.photos/seed/comic-candi/400/600",
    hint: "temple comic"
  },
  {
    id: "permainan",
    title: "Permainan Tradisional Nusantara",
    description: "Eksplorasi strategi berhitung lewat permainan Congklak dan Engklek.",
    module: "Permainan Nusantara",
    color: "bg-red-500",
    image: "https://picsum.photos/seed/comic-games/400/600",
    hint: "traditional games comic"
  }
];

export default function ComicListPage() {
  const { profile } = useUser();

  return (
    <div className="min-h-screen bg-slate-50 pb-32 overflow-y-auto">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-6 max-w-[500px] mx-auto">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-lg flex items-center gap-2 text-slate-900">
          <BookOpen className="h-5 w-5 text-primary" />
          Komik Digital
        </h1>
        <div className="w-10" />
      </header>

      <main className="pt-20 px-6 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-slate-900">Literasi Nusantara 📚</h2>
          <p className="text-sm text-muted-foreground">Petualangan seru asah kemampuan numerasi.</p>
        </div>

        <div className="grid gap-6">
          {COMICS.map((comic) => {
            const isRead = profile?.completedComics?.includes(comic.id);
            return (
              <Card key={comic.id} className="group overflow-hidden border-none shadow-xl rounded-[2rem] bg-white transition-all hover:shadow-2xl">
                <div className="relative aspect-[4/3] w-full">
                  <Image 
                    src={comic.image} 
                    alt={comic.title} 
                    fill 
                    className="object-cover"
                    data-ai-hint={comic.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {isRead && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <Badge className={cn(comic.color, "text-white border-none shadow-lg px-3 py-1 text-[10px] uppercase font-bold tracking-widest")}>
                      {comic.module}
                    </Badge>
                    <h3 className="text-white font-headline font-bold text-xl leading-tight">
                      {comic.title}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 font-medium leading-relaxed">
                    {comic.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wide">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Dapatkan +5 XP</span>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      {isRead ? (
                        <><CheckCircle2 className="h-3 w-3" /> Selesai</>
                      ) : (
                        <><Clock className="h-3 w-3" /> Belum Dibaca</>
                      )}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 gap-3">
                  <Link href={`/komik/${comic.id}`} className="flex-1">
                    <Button className={cn("w-full h-12 font-bold rounded-2xl shadow-lg gap-2", isRead ? "bg-slate-100 text-slate-500" : "bg-primary")}>
                      <Eye className="h-4 w-4" /> {isRead ? "Baca Lagi" : "Baca Komik"}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
