
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Star, ChevronRight, Palette, Layers, Move } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function BatikModulePage() {
  const batikImage = PlaceHolderImages.find(img => img.id === "batik-pattern") || PlaceHolderImages[0];

  const topics = [
    {
      id: "simetri",
      title: "Simetri Lipat & Putar",
      desc: "Menemukan garis simetri pada motif Parang dan Kawung.",
      icon: Layers,
      color: "bg-blue-500"
    },
    {
      id: "pola",
      title: "Pola & Teselasi",
      desc: "Bagaimana motif batik berulang secara matematis.",
      icon: Palette,
      color: "bg-orange-500"
    },
    {
      id: "transformasi",
      title: "Transformasi Geometri",
      desc: "Refleksi, Rotasi, dan Translasi dalam desain Batik.",
      icon: Move,
      color: "bg-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F5]">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <Badge variant="outline" className="border-primary text-primary">Matematika x Budaya</Badge>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <section className="relative h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <Image 
              src={batikImage.imageUrl} 
              alt="Batik Nusantara" 
              fill 
              className="object-cover"
              data-ai-hint="batik pattern"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-4xl font-headline font-bold text-white">Batik Nusantara</h1>
              <p className="text-white/80 max-w-lg">Eksplorasi konsep matematika di balik keindahan motif tradisional Indonesia.</p>
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

            <div className="grid gap-4">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/modules/batik/${topic.id}`}>
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
          <Card className="bg-primary text-primary-foreground rounded-3xl overflow-hidden border-none">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold">Siap Menguji Pengetahuanmu?</h3>
                <p className="opacity-90">Selesaikan kuis akhir untuk mendapatkan lencana "Ahli Batik"!</p>
              </div>
              <Link href="/modules/batik/quiz">
                <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-bold px-8 h-14 rounded-full">
                  Mulai Kuis Akhir
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
