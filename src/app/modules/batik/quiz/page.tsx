
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, ArrowLeft, Loader2, Star, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const QUESTIONS = [
  {
    question: "Motif batik Kawung memiliki berapa sumbu simetri?",
    options: ["2", "4", "6", "Tak terhingga"],
    correct: 1
  },
  {
    question: "Apa prinsip matematika yang digunakan dalam perulangan pola batik?",
    options: ["Probabilitas", "Teselasi", "Statistika", "Logaritma"],
    correct: 1
  },
  {
    question: "Jika motif batik dicerminkan, transformasi apa yang terjadi?",
    options: ["Rotasi", "Translasi", "Refleksi", "Dilatasi"],
    correct: 2
  }
];

export default function BatikQuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, user } = useUser();
  const db = useFirestore();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(optionIdx);
    const correct = optionIdx === QUESTIONS[currentQuestion].correct;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(q => q + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleFinish = async () => {
    if (!db || !user) return;
    
    setIsSubmitting(true);
    const userRef = doc(db, "users", user.uid);
    
    const xpGained = score * 10;
    const updateData = {
      poin: increment(xpGained),
      completedModules: arrayUnion("batik_nusantara")
    };

    updateDoc(userRef, updateData)
      .then(() => {
        toast({
          title: "Kuis Selesai!",
          description: `Selamat! Kamu mendapatkan ${xpGained} XP tambahan.`,
        });
        router.push("/dashboard/student");
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false);
      });
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center p-8 rounded-3xl shadow-2xl border-none">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline mb-2">Hebat!</CardTitle>
          <CardDescription className="text-lg mb-8">
            Kamu menjawab {score} dari {QUESTIONS.length} pertanyaan dengan benar.
          </CardDescription>
          
          <div className="bg-slate-50 p-6 rounded-2xl mb-8 flex items-center justify-center gap-4">
             <Star className="h-8 w-8 text-accent fill-current" />
             <div className="text-left">
               <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Poin Didapat</p>
               <p className="text-3xl font-bold">+{score * 10} XP</p>
             </div>
          </div>

          <Button 
            className="w-full h-14 text-lg font-bold" 
            onClick={handleFinish}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Klaim Hadiah & Selesai"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5] p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/modules/batik">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Keluar
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-sm font-bold text-muted-foreground">PERTANYAAN</p>
            <p className="text-xl font-bold">{currentQuestion + 1} / {QUESTIONS.length}</p>
          </div>
        </div>

        <Progress value={((currentQuestion + 1) / QUESTIONS.length) * 100} className="h-3" />

        <Card className="rounded-3xl shadow-xl border-none overflow-hidden">
          <div className="h-2 bg-primary" />
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-headline leading-tight">
              {QUESTIONS[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {QUESTIONS[currentQuestion].options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = idx === QUESTIONS[currentQuestion].correct;
              
              let variant: "outline" | "default" | "secondary" = "outline";
              if (isSelected) {
                variant = isCorrect ? "default" : "destructive" as any;
              } else if (selectedOption !== null && isCorrectOption) {
                variant = "default";
              }

              return (
                <Button
                  key={idx}
                  variant={variant}
                  className={`w-full h-16 text-lg justify-start px-6 gap-4 transition-all ${
                    selectedOption === null ? "hover:border-primary hover:bg-primary/5" : ""
                  } ${isSelected && isCorrect ? 'bg-green-600 hover:bg-green-600' : ''} ${isSelected && !isCorrect ? 'bg-red-600 hover:bg-red-600' : ''}`}
                  onClick={() => handleAnswer(idx)}
                >
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="flex-1 text-left">{option}</span>
                  {isSelected && isCorrect && <CheckCircle2 className="h-6 w-6" />}
                  {isSelected && !isCorrect && <XCircle className="h-6 w-6" />}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {selectedOption !== null && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${isCorrect ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-bold">Benar! Kamu hebat.</p>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                <p className="font-bold">Oops! Jawaban yang benar adalah {QUESTIONS[currentQuestion].options[QUESTIONS[currentQuestion].correct]}.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
