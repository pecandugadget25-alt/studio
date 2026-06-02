"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Camera, PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const moduleData = {
    batik: { title: "Batik Nusantara", topic: "Simetri & Pola", desc: "Pelajari konsep simetri lipat dan putar melalui keindahan motif batik tradisional Indonesia." },
    candi: { title: "Candi Nusantara", topic: "Geometri Bangun Ruang", desc: "Eksplorasi bangun ruang sisi datar dan lengkung yang membentuk kemegahan arsitektur candi." },
    masjid: { title: "Masjid Al Akbar", topic: "Geometri Masjid", desc: "Analisis geometris kubah dan menara masjid bersejarah di Indonesia." },
    games: { title: "Permainan Tradisional", topic: "Probabilitas & Strategi", desc: "Belajar peluang dan strategi matematika lewat permainan Congklak dan Engklek." }
  }[id as keyof typeof moduleData] || { title: "Modul Pembelajaran", topic: "Etnomatematika", desc: "Modul eksplorasi matematika berbasis budaya Indonesia." };

  const placeholder = PlaceHolderImages.find(img => img.id.includes(id)) || PlaceHolderImages[0];

  return (
    <div className="min-h-screen bg-[#FAF7F5]">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
          </Button>
        </Link>
        <Badge variant="outline" className="border-primary text-primary">{moduleData.topic}</Badge>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-headline font-bold">{moduleData.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {moduleData.desc}
              </p>
            </div>

            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src={placeholder.imageUrl} 
                alt={moduleData.title} 
                fill 
                className="object-cover"
                data-ai-hint={placeholder.imageHint}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <PlayCircle className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Materi Utama
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">1. Sejarah dan Filosofi Budaya</p>
                  <p className="text-sm">2. Identifikasi Objek Geometris</p>
                  <p className="text-sm">3. Rumus dan Teorema Relevan</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5 text-accent" /> Aktivitas AR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">1. Scan Marker Objek 3D</p>
                  <p className="text-sm">2. Manipulasi Dimensi Visual</p>
                  <p className="text-sm">3. Tantangan Observasi AR</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="rounded-3xl border-none shadow-lg">
              <CardHeader>
                <CardTitle>Mulai Belajar</CardTitle>
                <CardDescription>Selesaikan modul ini untuk mendapatkan 200 XP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full h-14 text-lg font-bold">Mulai Video Pembelajaran</Button>
                <Link href="/ar-scan" className="block">
                  <Button variant="outline" className="w-full h-14 text-lg font-bold gap-2">
                    <Camera className="h-5 w-5" /> Gunakan Scanner AR
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full h-14 text-lg font-bold" disabled>
                  Ambil Kuis (Terkunci)
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl bg-primary text-primary-foreground border-none overflow-hidden relative">
              <CardContent className="p-8 space-y-4 relative z-10">
                <h3 className="text-xl font-bold">Informasi Penting</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Modul ini merupakan prasyarat untuk membuka tantangan 'Geometri Kompleks' di Level 6. Pastikan Anda memahami konsep dasar simetri sebelum melanjutkan ke kuis.
                </p>
              </CardContent>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <BookOpen className="h-40 w-40 rotate-12" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
