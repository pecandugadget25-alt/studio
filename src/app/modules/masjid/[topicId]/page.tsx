
"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MasjidTopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [step, setStep] = useState(0);

  const topicContent = {
    "simetri": {
      title: "Simetri Arsitektur",
      badge: "Keseimbangan",
      content: [
        {
          text: "Arsitektur masjid seringkali menggunakan prinsip simetri untuk menciptakan kesan damai dan seimbang. Gerbang utama biasanya memiliki sumbu simetri vertikal.",
          image: "https://picsum.photos/seed/mosque-gate/800/600",
          hint: "mosque gate symmetry"
        },
        {
          text: "Simetri lipat dapat kita temukan jika kita membayangkan membagi denah masjid menjadi dua bagian yang sama persis.",
          image: "https://picsum.photos/seed/mosque-plan/800/600",
          hint: "mosque architecture plan"
        }
      ]
    },
    "bangun-ruang": {
      title: "Bangun Ruang Masjid",
      badge: "3D Geometri",
      content: [
        {
          text: "Menara masjid adalah contoh nyata dari bangun ruang tabung atau silinder yang menjulang tinggi.",
          image: "https://picsum.photos/seed/minaret-3d/800/600",
          hint: "mosque minaret tower"
        },
        {
          text: "Ruang utama masjid seringkali berbentuk balok atau kubus besar yang mampu menampung banyak jamaah.",
          image: "https://picsum.photos/seed/mosque-hall/800/600",
          hint: "mosque prayer hall"
        }
      ]
    },
    "kubah-geometri": {
      title: "Kubah & Setengah Bola",
      badge: "Bola",
      content: [
        {
          text: "Kubah masjid adalah bentuk setengah bola. Secara matematis, kita bisa menghitung volume udara di dalamnya menggunakan rumus bola.",
          image: "https://picsum.photos/seed/mosque-dome-inside/800/600",
          hint: "mosque dome geometry"
        }
      ]
    },
    "pola-matematika": {
      title: "Pola & Ornamen",
      badge: "Pengubinan",
      content: [
        {
          text: "Ornamen pada dinding masjid sering menggunakan pola geometri yang berulang tanpa celah, yang disebut Teselasi atau Pengubinan.",
          image: "https://picsum.photos/seed/islamic-pattern/800/600",
          hint: "islamic geometric pattern"
        }
      ]
    }
  }[topicId as keyof typeof topicContent] || topicContent["simetri"];

  const isLastStep = step === topicContent.content.length - 1;

  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 bg-white z-40">
        <Link href="/modules/masjid">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Daftar Materi
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-600">{topicContent.badge}</Badge>
          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 transition-all duration-500" 
              style={{ width: `${((step + 1) / topicContent.content.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-emerald-700">{topicContent.title}</h1>
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

          <Card className="border-none bg-[#F0FDF4] rounded-3xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-2xl">
                  <BookOpen className="h-6 w-6 text-emerald-700" />
                </div>
                <p className="text-xl leading-relaxed text-slate-800">
                  {topicContent.content[step].text}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm font-medium italic text-slate-600">Fakta Numerasi: Kubah Masjid Al-Akbar Surabaya memiliki pola geometris yang sangat kompleks, terdiri dari ribuan panel segitiga dan belah ketupat.</p>
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
              <Link href="/modules/masjid">
                <Button className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg gap-2 shadow-lg">
                  Selesaikan Topik <CheckCircle2 className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => setStep(s => s + 1)}
                className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg gap-2 shadow-lg"
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
