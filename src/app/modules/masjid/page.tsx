
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, ChevronRight, Landmark, Disc, LayoutGrid, CircleDot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function MasjidModulePage() {
  const masjidImage = PlaceHolderImages.find(img => img.id === "mosque-architecture") || PlaceHolderImages[0];

  const topics = [
    {
      id: "simetri",
      title: "Simetri Arsitektur",
      desc: "Menemukan keseimbangan geometris pada gerbang dan fasad masjid.",
      icon: LayoutGrid,
      color: "bg-emerald-500"
    },
    {
      id: "bangun-ruang",
      title: "Bangun Ruang Masjid",
      desc: "Identifikasi kubus, balok, dan tabung pada struktur utama.",
      icon: Landmark,
      color: "bg-blue-500"
    },
    {
      id: "kubah-geometri",
      title: "Kubah & Setengah Bola",
      desc: "Mempelajari volume dan luas permukaan kubah yang megah.",
      icon: Disc,
      color: "bg-amber-500"
    },
    {
      id: "pola-matematika",
      title: "Pola & Ornamen",
      desc: "Analisis pengubinan (tessellation) pada dinding dan lantai.",
      icon: CircleDot,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5] pt-16">
      <header className="sticky top-16 z-30 border-b bg-white">
        <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <Badge variant="outline" className="border-primary text-primary">Religi x Matematika</Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* Hero Section */}
          <section className="relative h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <Image 
              src={masjidImage.imageUrl} 
              alt="Masjid Al Akbar" 
              fill 
              className="object-cover"
              data-ai-hint="mosque architecture"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-4xl font-headline font-bold text-white">Masjid Al Akbar</h1>
              <p className="text-white/80 max-w-lg">Eksplorasi keindahan arsitektur masjid melalui kacamata matematika.</p>
            </div>
          </section>

          {/* Topics Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headline font-bold">Topik Pembelajaran</h2>
              <div className="flex items-center gap-1 text-accent font-bold">
                <Star className="h-5 w-5 fill-current" />
                <span>+10 XP per Topik</span>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/modules/masjid/${topic.id}`}>
                  <Card className="group hover:shadow-lg transition-all cursor-pointer border-none shadow-sm">
                    <CardContent className="p-6 flex items-center gap-6">
                      <div className={`w-16 h-16 ${topic.color} rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                        <topic.icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="text-xl font-bold">{topic.title}</h3>
                        <p className="text-muted-foreground">{topic.desc}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Final Quiz Call to Action */}
          <Card className="bg-primary text-primary-foreground rounded-3xl overflow-hidden border-none shadow-2xl">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold">Sudah Paham Geometri Masjid?</h3>
                <p className="opacity-90">Selesaikan kuis untuk mendapatkan lencana "Penjaga Warisan"!</p>
              </div>
              <Link href="/modules/masjid/quiz">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-bold px-8 h-14 rounded-full">
                  Mulai Kuis Masjid
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
