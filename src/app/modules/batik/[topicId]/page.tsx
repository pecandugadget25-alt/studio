
"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BatikTopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [step, setStep] = useState(0);

  const topicContent = {
    simetri: {
      title: "Simetri Lipat & Putar",
      badge: "Geometri",
      content: [
        {
          text: "Simetri adalah keseimbangan antara dua sisi. Dalam batik, simetri sering ditemukan pada motif Kawung yang memiliki empat sumbu simetri.",
          image: "https://picsum.photos/seed/kawung/800/600",
          hint: "batik kawung motif"
        },
        {
          text: "Cobalah bayangkan melipat kain batik ini. Jika kedua sisi bertemu dengan sempurna, itulah yang disebut Garis Simetri.",
          image: "https://picsum.photos/seed/symmetry/800/600",
          hint: "symmetry line illustration"
        }
      ]
    },
    pola: {
      title: "Pola & Teselasi",
      badge: "Pola",
      content: [
        {
          text: "Teselasi adalah pengubinan permukaan menggunakan satu atau lebih bentuk geometris tanpa celah atau tumpang tindih.",
          image: "https://picsum.photos/seed/tessellation/800/600",
          hint: "tessellation pattern"
        }
      ]
    },
    transformasi: {
      title: "Transformasi Geometri",
      badge: "Transformasi",
      content: [
        {
          text: "Transformasi geometri meliputi Refleksi (pencerminan), Rotasi (perputaran), dan Translasi (pergeseran).",
          image: "https://picsum.photos/seed/transform/800/600",
          hint: "geometry transformation"
        }
      ]
    }
  }[topicId as keyof typeof topicContent] || topicContent.simetri;

  const isLastStep = step === topicContent.content.length - 1;

  return (
    <div className="min-h-screen bg-white pb-32 overflow-y-auto">
      <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 bg-white z-40">
        <Link href="/modules/batik">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Daftar Materi
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge className="bg-accent">{topicContent.badge}</Badge>
          <div className="h-2 w-24 sm:w-32 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${((step + 1) / topicContent.content.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary">{topicContent.title}</h1>
            <p className="text-muted-foreground">Bagian {step + 1} dari {topicContent.content.length}</p>
          </div>

          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-slate-50">
            <Image 
              src={topicContent.content[step].image} 
              alt={topicContent.title} 
              fill 
              className="object-cover"
              data-ai-hint={topicContent.content[step].hint}
            />
          </div>

          <Card className="border-none bg-slate-50 rounded-3xl">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg sm:text-xl leading-relaxed text-slate-800">
                  {topicContent.content[step].text}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-accent shrink-0" />
                <p className="text-sm font-medium italic">Tahukah kamu? Batik Parang menggunakan prinsip refleksi berulang untuk menciptakan kesan aliran air.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-8 border-t">
            <Button 
              variant="outline" 
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="h-12 px-4 sm:px-6"
            >
              Sebelumnya
            </Button>

            {isLastStep ? (
              <Link href="/modules/batik">
                <Button className="h-14 px-6 sm:px-8 bg-primary font-bold text-base sm:text-lg gap-2 shadow-lg">
                  Selesaikan <CheckCircle2 className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => setStep(s => s + 1)}
                className="h-14 px-6 sm:px-8 bg-primary font-bold text-base sm:text-lg gap-2 shadow-lg"
              >
                Lanjut <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
