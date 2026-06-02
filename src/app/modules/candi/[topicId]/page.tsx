
"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, CheckCircle2, Box } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CandiTopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [step, setStep] = useState(0);

  const topicContent = {
    "bangun-ruang": {
      title: "Mengenal Bangun Ruang",
      badge: "Dasar Geometri",
      content: [
        {
          text: "Bangun ruang adalah bangun tiga dimensi yang memiliki volume. Pada candi, kita bisa melihat kubus, balok, dan prisma.",
          image: "https://picsum.photos/seed/temple1/800/600",
          hint: "temple architecture"
        },
        {
          text: "Setiap bagian candi mulai dari kaki, tubuh, hingga atap tersusun dari ribuan blok batu yang membentuk bangun ruang.",
          image: "https://picsum.photos/seed/temple2/800/600",
          hint: "stone layers"
        }
      ]
    },
    "kubus": {
      title: "Konsep Kubus",
      badge: "Kubus",
      content: [
        {
          text: "Kubus adalah bangun ruang yang semua rusuknya sama panjang. Batu andesit penyusun candi seringkali dipotong menyerupai kubus agar kokoh.",
          image: "https://picsum.photos/seed/cube/800/600",
          hint: "stone cube"
        },
        {
          text: "Kubus memiliki 6 sisi berbentuk persegi yang identik, 12 rusuk, dan 8 titik sudut.",
          image: "https://picsum.photos/seed/geometry-cube/800/600",
          hint: "geometry cube"
        }
      ]
    },
    "balok": {
      title: "Konsep Balok",
      badge: "Balok",
      content: [
        {
          text: "Balok adalah bangun ruang yang dibatasi oleh tiga pasang persegi panjang. Bagian gerbang candi biasanya menggunakan struktur balok.",
          image: "https://picsum.photos/seed/templegate/800/600",
          hint: "temple gate"
        }
      ]
    },
    "geometri-candi": {
      title: "Geometri Candi Utuh",
      badge: "Analisis",
      content: [
        {
          text: "Gabungan dari berbagai bangun ruang membentuk kemegahan candi. Candi Borobudur misalnya, memiliki dasar berbentuk persegi (balok sangat besar).",
          image: "https://picsum.photos/seed/borobudur/800/600",
          hint: "borobudur geometry"
        }
      ]
    }
  }[topicId as keyof typeof topicContent] || topicContent["bangun-ruang"];

  const isLastStep = step === topicContent.content.length - 1;

  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 bg-white z-40">
        <Link href="/modules/candi">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Daftar Materi
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary">{topicContent.badge}</Badge>
          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${((step + 1) / topicContent.content.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-primary">{topicContent.title}</h1>
            <p className="text-muted-foreground">Bagian {step + 1} dari {topicContent.content.length}</p>
          </div>

          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-50">
            <Image 
              src={topicContent.content[step].image} 
              alt={topicContent.title} 
              fill 
              className="object-cover"
              data-ai-hint={topicContent.content[step].hint}
            />
          </div>

          <Card className="border-none bg-[#FAF7F5] rounded-3xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xl leading-relaxed text-slate-800">
                  {topicContent.content[step].text}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-accent shrink-0" />
                <p className="text-sm font-medium italic">Fakta Unik: Candi Borobudur dibangun tanpa menggunakan semen, melainkan menggunakan sistem kuncian batu (interlock) yang sangat presisi secara geometris.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-8 border-t">
            <Button 
              variant="outline" 
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="h-12 px-6"
            >
              Sebelumnya
            </Button>

            {isLastStep ? (
              <Link href="/modules/candi">
                <Button className="h-14 px-8 bg-primary font-bold text-lg gap-2 shadow-lg">
                  Selesaikan Topik <CheckCircle2 className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => setStep(s => s + 1)}
                className="h-14 px-8 bg-primary font-bold text-lg gap-2 shadow-lg"
              >
                Selanjutnya <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
