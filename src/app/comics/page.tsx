
'use client';

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft, Star, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import Image from "next/image";

const COMICS = [
  {
    id: "komik-1",
    title: "Misteri Simetri Batik",
    module: "Batik Nusantara",
    color: "bg-orange-500",
    image: "https://picsum.photos/seed/comic-batik/400/600",
    hint: "batik comic"
  },
  {
    id: "komik-2",
    title: "Petualangan di Candi Megah",
    module: "Candi Nusantara",
    color: "bg-primary",
    image: "https://picsum.photos/seed/comic-candi/400/600",
    hint: "temple comic"
  },
  {
    id: "komik-3",
    title: "Rahasia Geometri Masjid",
    module: "Masjid Nusantara",
    color: "bg-emerald-600",
    image: "https://picsum.photos/seed/comic-mosque/400/600",
    hint: "mosque comic"
  }
];

export default function ComicListPage() {
  const { profile } = useUser();

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-20">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Komik Petualangan
        </h1>
        <div className="flex items-center gap-1 text-accent font-bold text-sm bg-accent/10 px-3 py-1 rounded-full">
          <Star className="h-4 w-4 fill-current" />
          <span>+5 XP / Komik</span>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-headline font-bold">Pilih Petualanganmu! 📚</h2>
          <p className="text-muted-foreground">Baca komik seru dan temukan matematika di sekitarmu.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {COMICS.map((comic) => {
            const isRead = profile?.completedComics?.includes(comic.id);
            return (
              <Card key={comic.id} className="group overflow-hidden border-none shadow-xl rounded-3xl transition-transform hover:-translate-y-2">
                <div className="relative aspect-[3/4]">
                  <Image 
                    src={comic.image} 
                    alt={comic.title} 
                    fill 
                    className="object-cover"
                    data-ai-hint={comic.hint}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent`} />
                  {isRead && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <Badge className={`${comic.color} text-white border-none shadow-lg`}>
                      {comic.module}
                    </Badge>
                    <h3 className="text-white font-headline font-bold text-xl leading-tight">
                      {comic.title}
                    </h3>
                  </div>
                </div>
                <CardFooter className="p-6 bg-white">
                  <Link href={`/comics/${comic.id}`} className="w-full">
                    <Button className="w-full h-12 font-bold text-lg rounded-2xl shadow-lg shadow-primary/20">
                      {isRead ? "Baca Lagi" : "Mulai Baca"}
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
