'use client';

import { use, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Star, 
  Trophy, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Loader2,
  Mail,
  Zap,
  Sparkles,
  BrainCircuit,
  Target,
  LineChart,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore";
import { analyzeStudentIndividually, type StudentAnalysisOutput } from "@/ai/flows/student-individual-analysis";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StudentAnalysisOutput | null>(null);

  const studentRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, "users", id);
  }, [db, id]);

  const { data: student, loading } = useDoc(studentRef);

  // Ambil aktivitas terakhir untuk konteks AI
  const activityQuery = useMemo(() => {
    if (!db || !id) return null;
    return query(
      collection(db, "activities"),
      where("userId", "==", id),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [db, id]);

  const { data: recentActivities } = useCollection(activityQuery);

  const MODULE_LIST = [
    { id: 'batik', name: 'Batik Nusantara' },
    { id: 'candi', name: 'Candi Nusantara' },
    { id: 'masjid', name: 'Masjid Al Akbar' },
    { id: 'games', name: 'Permainan Tradisional' },
  ];

  const handleGenerateAI = async () => {
    if (!student) return;

    setIsAnalyzing(true);
    
    // Hitung data pendukung
    const completed = MODULE_LIST
      .filter(m => student.completedModules?.includes(m.id))
      .map(m => m.name);
    
    const unfinished = MODULE_LIST
      .filter(m => !student.completedModules?.includes(m.id))
      .map(m => m.name);

    const activityContext = recentActivities
      ?.map(a => `${a.title}: ${a.description}`)
      .join(". ") || "Belum ada aktivitas tercatat.";

    try {
      const result = await analyzeStudentIndividually({
        nama: student.nama,
        level: student.level || 1,
        poin: student.poin || 0,
        badgeCount: student.badges?.length || 0,
        completedModules: completed,
        unfinishedModules: unfinished,
        activitySummary: activityContext
      });
      setAnalysisResult(result);
      toast({ title: "Analisis Berhasil", description: "Wawasan ETHNO-AI telah diperbarui." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal", description: "AI sedang sibuk, coba lagi nanti." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'aman': return { color: 'bg-green-500', text: '🟢 Aman' };
      case 'perhatian': return { color: 'bg-yellow-500', text: '🟡 Perhatian' };
      case 'risiko': return { color: 'bg-red-500', text: '🔴 Risiko' };
      default: return { color: 'bg-slate-400', text: 'Status Normal' };
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-muted-foreground">Siswa tidak ditemukan.</p>
        <Link href="/teacher/students">
          <Button>Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 android-shadow max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/teacher/students">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight uppercase">Detail Profil</h1>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="rounded-[2.5rem] border-none p-6 bg-white shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100">
             <img 
              src={`https://picsum.photos/seed/${student.uid}/200/200`} 
              alt={student.nama} 
              className="w-full h-full object-cover"
             />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold">{student.nama}</h2>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Mail className="h-3 w-3" /> {student.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-primary px-4 py-1 rounded-full uppercase text-[10px] font-bold">Level {student.level || 1}</Badge>
            <Badge variant="outline" className="px-4 py-1 rounded-full uppercase text-[10px] font-bold border-primary text-primary">Siswa Aktif</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50/50 p-4 rounded-3xl border border-yellow-100/50 text-center space-y-1">
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Total XP</p>
            <div className="flex items-center justify-center gap-1.5">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-xl font-bold text-yellow-700">{student.poin || 0}</span>
            </div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50 text-center space-y-1">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Lencana</p>
            <div className="flex items-center justify-center gap-1.5">
              <Trophy className="h-5 w-5 text-blue-500" />
              <span className="text-xl font-bold text-blue-700">{student.badges?.length || 0}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Analysis Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Analisis ETHNO-AI
          </h3>
          {analysisResult && (
            <Badge className={cn("px-3 py-0.5 rounded-full uppercase text-[9px] font-bold", getRiskStyles(analysisResult.riskLevel).color)}>
              {getRiskStyles(analysisResult.riskLevel).text}
            </Badge>
          )}
        </div>

        {!analysisResult && !isAnalyzing ? (
          <Card className="rounded-[2rem] border-none bg-gradient-to-br from-indigo-600 to-primary p-6 text-center space-y-4 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md mb-4">
                <BrainCircuit className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-1 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Wawasan Akademik</p>
                <h4 className="font-headline font-bold text-lg">Generate Analisis Realtime</h4>
                <p className="text-[10px] opacity-70 leading-relaxed px-4">Dapatkan prediksi performa berdasarkan data aktivitas terbaru siswa.</p>
              </div>
              <Button className="w-full h-12 bg-white text-primary font-bold rounded-2xl shadow-xl hover:bg-slate-50 mt-4 active:scale-95 transition-transform" onClick={handleGenerateAI}>
                Generate Laporan AI
              </Button>
            </div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          </Card>
        ) : isAnalyzing ? (
          <Card className="rounded-[2rem] border-none bg-white p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menganalisis Progres...</p>
              <p className="text-[10px] text-muted-foreground italic">Menghitung XP dan status modul {student.nama}</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Ringkasan */}
            <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-sm space-y-4 border-l-8 border-primary">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ringkasan Kemampuan</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{analysisResult?.summary}"</p>
            </Card>

            {/* Grid Kelebihan & Area Pengembangan */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-3xl border-none p-5 bg-emerald-50 space-y-3">
                <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                   <Star className="h-3 w-3 fill-current" /> Kelebihan
                </p>
                <ul className="space-y-1.5">
                  {analysisResult?.strengths.map((s, i) => (
                    <li key={i} className="text-[9px] font-bold text-emerald-900 flex gap-1">✓ {s}</li>
                  ))}
                </ul>
              </Card>
              <Card className="rounded-3xl border-none p-5 bg-orange-50 space-y-3">
                <p className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1">
                   <Target className="h-3 w-3" /> Area Pengembangan
                </p>
                <ul className="space-y-1.5">
                  {analysisResult?.improvementAreas.map((w, i) => (
                    <li key={i} className="text-[9px] font-bold text-orange-900 flex gap-1">• {w}</li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Instruksi & Prediksi */}
            <Card className="rounded-3xl border-none p-6 bg-slate-900 text-white space-y-4 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Instruksi Guru & Prediksi</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Saran Pengajaran:</p>
                    <div className="space-y-1.5">
                      {analysisResult?.teacherRecommendations.map((r, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <span className="text-primary font-bold text-xs">{i + 1}.</span>
                          <p className="text-xs font-medium opacity-90 leading-tight">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prediksi Perkembangan:</p>
                    <p className="text-xs font-bold text-primary italic leading-relaxed flex gap-2 items-start">
                      <Lightbulb className="h-3 w-3 shrink-0" />
                      {analysisResult?.prediction}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            </Card>

            <Button variant="ghost" className="w-full text-xs font-bold text-slate-400 hover:text-primary transition-colors" onClick={() => setAnalysisResult(null)}>
              Reset Analisis
            </Button>
          </div>
        )}
      </section>

      {/* Progress Modul */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm px-1 flex items-center gap-2 text-slate-900">
          <BookOpen className="h-4 w-4 text-primary" /> Progres Materi
        </h3>
        <div className="space-y-3">
          {MODULE_LIST.map((mod) => {
            const isCompleted = student.completedModules?.includes(mod.id);
            return (
              <Card key={mod.id} className="rounded-2xl border-none p-4 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">{mod.name}</span>
                  {isCompleted ? (
                    <Badge className="bg-green-500 text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded-lg">Selesai</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded-lg">Belum Selesai</Badge>
                  )}
                </div>
                <Progress value={isCompleted ? 100 : 0} className={cn("h-1.5", isCompleted ? "bg-green-100" : "bg-slate-100")} />
              </Card>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4 pb-10">
        <h3 className="font-headline font-bold text-sm px-1 flex items-center gap-2 text-slate-900">
          <Award className="h-4 w-4 text-accent" /> Lencana Dicapai
        </h3>
        {student.badges && student.badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {student.badges.map((badge: string, idx: number) => (
              <Card key={idx} className="rounded-2xl border-none p-3 bg-white shadow-sm flex items-center gap-3 active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <span className="text-[10px] font-bold leading-tight uppercase text-slate-600 line-clamp-2">{badge}</span>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <p className="text-xs text-muted-foreground italic px-10">Belum ada lencana yang didapatkan siswa ini.</p>
          </div>
        )}
      </section>
    </div>
  );
}
