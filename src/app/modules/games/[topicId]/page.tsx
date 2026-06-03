"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2,
  Sparkles,
  Loader2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { explainMaterial } from "@/ai/flows/explain-material-flow";

export default function GamesTopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [step, setStep] = useState(0);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const topicContent = {
    "operasi-hitung": {
      title: "Operasi Hitung (Congklak)",
      badge: "Berhitung",
      content: [
        {
          text: "Permainan Congklak adalah cara seru belajar pembagian dan penjumlahan. Saat kita membagikan biji ke setiap lubang, kita sedang melakukan operasi distribusi.",
          image: "https://picsum.photos/seed/congklak/800/600",
          hint: "congklak game"
        },
        {
          text: "Jika kita memiliki 7 biji dan membagikannya secara merata, kita belajar sisa bagi (modulus) jika biji terakhir jatuh di lubang tertentu.",
          image: "https://picsum.photos/seed/congklak-seeds/800/600",
          hint: "counting seeds"
        }
      ]
    },
    "pola-bilangan": {
      title: "Pola Bilangan (Engklek)",
      badge: "Pola",
      content: [
        {
          text: "Engklek menggunakan petak-petak bernomor yang membentuk pola tertentu. Melompat dari satu petak ke petak lain membantu kita memahami urutan bilangan.",
          image: "https://picsum.photos/seed/engklek/800/600",
          hint: "engklek hopscotch"
        },
        {
          text: "Pola petak ganda dan tunggal melatih kita mengenali pola ganjil dan genap secara spasial.",
          image: "https://picsum.photos/seed/numbers-pattern/800/600",
          hint: "number pattern"
        }
      ]
    },
    "strategi-berhitung": {
      title: "Strategi Berhitung",
      badge: "Logika",
      content: [
        {
          text: "Memenangkan permainan tradisional membutuhkan estimasi dan prediksi. Kita harus menghitung langkah lawan dan merencanakan langkah kita selanjutnya.",
          image: "https://picsum.photos/seed/game-strategy/800/600",
          hint: "kids playing"
        }
      ]
    },
    "numerasi-budaya": {
      title: "Numerasi dalam Budaya",
      badge: "Etnomatematika",
      content: [
        {
          text: "Matematika tidak hanya ada di buku sekolah. Leluhur kita menggunakan prinsip matematika yang canggih untuk menciptakan permainan yang mendidik.",
          image: "https://picsum.photos/seed/traditional-culture/800/600",
          hint: "traditional indonesian"
        }
      ]
    }
  }[topicId as keyof typeof topicContent] || topicContent["operasi-hitung"];

  const currentStepData = topicContent.content[step];
  const isLastStep = step === topicContent.content.length - 1;

  const handleExplain = async () => {
    setIsExplaining(true);
    try {
      const result = await explainMaterial({ materialText: currentStepData.text });
      setExplanation(result.explanation);
    } catch (error) {
      setExplanation("Ayo mainkan permainan tradisional ini sambil berhitung, seru lho!");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32 overflow-y-auto">
      <header className="h-16 border-b flex items-center justify-between px-6 sticky top-0 bg-white z-40">
        <Link href="/modules/games">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Daftar Materi
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge className="bg-orange-500">{topicContent.badge}</Badge>
          <div className="h-2 w-24 sm:w-32 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all duration-500" 
              style={{ width: `${((step + 1) / topicContent.content.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-headline font-bold text-orange-700">{topicContent.title}</h1>
            <p className="text-muted-foreground">Bagian {step + 1} dari {topicContent.content.length}</p>
          </div>

          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border-4 sm:border-8 border-slate-50">
            <Image 
              src={currentStepData.image} 
              alt={topicContent.title} 
              fill 
              className="object-cover"
              data-ai-hint={currentStepData.hint}
            />
          </div>

          <Card className="border-none bg-orange-50 rounded-3xl">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-2xl shrink-0">
                  <BookOpen className="h-6 w-6 text-orange-700" />
                </div>
                <div className="space-y-4">
                  <p className="text-lg sm:text-xl leading-relaxed text-slate-800">
                    {currentStepData.text}
                  </p>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-accent text-accent hover:bg-accent/5 font-bold gap-2"
                        onClick={handleExplain}
                      >
                        <Sparkles className="h-4 w-4" /> Jelaskan Materi
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-700 font-headline">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            👨‍🏫
                          </div>
                          Penjelasan Pak Guru AI
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        {isExplaining ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-accent" />
                            <p className="text-sm font-medium text-slate-400">Pak Guru sedang berpikir kreatif...</p>
                          </div>
                        ) : (
                          <div className="bg-slate-50 p-6 rounded-2xl">
                            <p className="text-sm leading-relaxed text-slate-600 font-medium italic">
                              "{explanation}"
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-orange-100 flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm font-medium italic text-slate-600">Tips Numerasi: Dalam Congklak, cobalah menghitung biji di lubang lawan untuk memastikan langkah 'tembak' yang menguntungkan!</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center pt-8 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setStep(s => Math.max(0, s - 1));
                setExplanation(null);
              }}
              disabled={step === 0}
              className="h-12 px-4 sm:px-6"
            >
              Sebelumnya
            </Button>

            {isLastStep ? (
              <Link href="/modules/games">
                <Button className="h-14 px-6 sm:px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base sm:text-lg gap-2 shadow-lg">
                  Selesaikan <CheckCircle2 className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => {
                  setStep(s => s + 1);
                  setExplanation(null);
                }}
                className="h-14 px-6 sm:px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base sm:text-lg gap-2 shadow-lg"
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
