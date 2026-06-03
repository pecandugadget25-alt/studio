
'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Sparkles, 
  ArrowLeft, 
  Users, 
  ChevronRight, 
  Loader2,
  BrainCircuit,
  Zap,
  Star,
  Target,
  AlertTriangle,
  History
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, addDoc, serverTimestamp, orderBy, limit } from "firebase/firestore";
import { analyzeStudentIndividually, type StudentAnalysisOutput } from "@/ai/flows/student-individual-analysis";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function TeacherAIAnalysisPage() {
  const { db } = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StudentAnalysisOutput | null>(null);

  // Get all students for selection
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: allStudents, loading: studentsLoading } = useCollection(studentsQuery);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];
    return allStudents.filter(s => 
      s.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.uid?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allStudents, searchTerm]);

  // Historical analyses for selected student
  const historyQuery = useMemo(() => {
    if (!db || !selectedStudent) return null;
    return query(
      collection(db, "student_ai_analysis"),
      where("studentId", "==", selectedStudent.uid),
      orderBy("generatedAt", "desc"),
      limit(5)
    );
  }, [db, selectedStudent?.uid]);

  const { data: analysisHistory } = useCollection(historyQuery);

  const handleGenerateAI = async () => {
    if (!selectedStudent || !db) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeStudentIndividually({
        nama: selectedStudent.nama,
        level: selectedStudent.level || 1,
        poin: selectedStudent.poin || 0,
        scanCount: selectedStudent.scanCount || 0,
        completedModules: selectedStudent.completedModules || [],
        completedComics: selectedStudent.completedComics || [],
        completedVideos: selectedStudent.completedVideos || [],
        recentActivities: [] // In production, fetch these from Firestore collection
      });

      setAnalysisResult(result);

      // Save to Firestore
      await addDoc(collection(db, "student_ai_analysis"), {
        studentId: selectedStudent.uid,
        studentName: selectedStudent.nama,
        ...result,
        generatedAt: serverTimestamp()
      });

      toast({
        title: "Analisis Berhasil",
        description: `Analisis AI untuk ${selectedStudent.nama} telah selesai dibuat.`
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Analisis Gagal",
        description: "Terjadi kesalahan teknis saat menghubungi ETHNO-AI."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'aman': return 'bg-green-500';
      case 'perhatian': return 'bg-yellow-500';
      case 'risiko': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center justify-between px-6 max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary">AI ANALISIS SISWA</h1>
        </div>
        <div className="bg-primary/10 p-2 rounded-xl">
           <BrainCircuit className="h-5 w-5 text-primary" />
        </div>
      </header>

      {!selectedStudent ? (
        <section className="space-y-4">
          <div className="px-1">
            <h2 className="text-2xl font-headline font-bold text-slate-900">Pilih Siswa 🕵️‍♂️</h2>
            <p className="text-sm text-muted-foreground">Cari siswa yang ingin Anda analisis secara mendalam.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari nama, email, atau ID..." 
              className="pl-10 h-12 bg-white rounded-2xl border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {studentsLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredStudents.map((s) => (
              <Card 
                key={s.uid} 
                className="rounded-3xl border-none p-4 bg-white shadow-sm hover:ring-2 ring-primary/20 transition-all cursor-pointer"
                onClick={() => setSelectedStudent(s)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-50">
                    <img src={`https://picsum.photos/seed/${s.uid}/100/100`} alt={s.nama} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{s.nama}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">LV. {s.level} • {s.poin} XP</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {/* Selected Student Profile Header */}
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                   <img src={`https://picsum.photos/seed/${selectedStudent.uid}/100/100`} alt="Siswa" />
                </div>
                <div>
                   <h3 className="font-headline font-bold text-slate-900 leading-tight">{selectedStudent.nama}</h3>
                   <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary uppercase" onClick={() => {
                     setSelectedStudent(null);
                     setAnalysisResult(null);
                   }}>Ganti Siswa</Button>
                </div>
             </div>
             <Badge className={cn("px-4 py-1.5 rounded-full uppercase text-[10px] font-bold", getRiskColor(analysisResult?.riskLevel || 'default'))}>
                {analysisResult?.riskLevel ? `Status: ${analysisResult.riskLevel}` : 'Analisis Baru'}
             </Badge>
          </div>

          {!analysisResult && !isAnalyzing ? (
            <Card className="rounded-[2rem] border-none bg-gradient-to-br from-primary to-blue-700 text-white p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-md">
                    <Sparkles className="h-10 w-10 text-yellow-300" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-headline font-bold">Siap Menganalisis?</h4>
                    <p className="text-sm opacity-80 px-4">ETHNO-AI akan membaca seluruh jejak belajar {selectedStudent.nama} untuk memberikan laporan performa personal.</p>
                  </div>
                  <Button 
                    className="w-full h-14 bg-white text-primary hover:bg-slate-50 font-bold rounded-2xl shadow-lg"
                    onClick={handleGenerateAI}
                  >
                    Generate Analisis AI
                  </Button>
               </div>
               <div className="absolute -right-8 -bottom-8 bg-white/10 w-32 h-32 rounded-full blur-3xl" />
            </Card>
          ) : isAnalyzing ? (
            <Card className="rounded-[2rem] border-none p-12 bg-white shadow-sm flex flex-col items-center justify-center space-y-6">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <div className="text-center space-y-2">
                  <h4 className="font-bold text-slate-900">Membaca Database...</h4>
                  <p className="text-xs text-muted-foreground">ETHNO-AI sedang meninjau level, poin, dan modul siswa.</p>
               </div>
            </Card>
          ) : (
            /* AI Result Display */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Summary Card */}
               <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                       <Zap className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Profil Belajar AI</span>
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-slate-900">{analysisResult?.learningProfile}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">"{analysisResult?.narrative}"</p>
               </Card>

               <div className="grid grid-cols-2 gap-4">
                  <Card className="rounded-3xl border-none p-4 bg-emerald-50 space-y-3">
                     <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-emerald-600 fill-current" />
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">Kekuatan</span>
                     </div>
                     <ul className="space-y-2">
                        {analysisResult?.strengths.map((s, i) => (
                          <li key={i} className="text-[10px] font-medium text-emerald-900 flex gap-2">
                             <span className="text-emerald-400">•</span> {s}
                          </li>
                        ))}
                     </ul>
                  </Card>
                  <Card className="rounded-3xl border-none p-4 bg-orange-50 space-y-3">
                     <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-700 uppercase">Kelemahan</span>
                     </div>
                     <ul className="space-y-2">
                        {analysisResult?.weaknesses.map((w, i) => (
                          <li key={i} className="text-[10px] font-medium text-orange-900 flex gap-2">
                             <span className="text-orange-400">•</span> {w}
                          </li>
                        ))}
                     </ul>
                  </Card>
               </div>

               {/* Recommendations */}
               <Card className="rounded-3xl border-none p-6 bg-slate-900 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Saran Pengajaran</span>
                  </div>
                  <div className="space-y-3">
                     {analysisResult?.recommendations.map((r, i) => (
                        <div key={i} className="flex gap-3 items-start">
                           <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold">
                              {i + 1}
                           </div>
                           <p className="text-xs font-medium leading-relaxed opacity-90">{r}</p>
                        </div>
                     ))}
                  </div>
               </Card>

               <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl font-bold border-2 border-slate-100"
                onClick={() => setAnalysisResult(null)}
               >
                 Buat Analisis Ulang
               </Button>
            </div>
          )}

          {/* Analysis History Widget */}
          {analysisHistory && analysisHistory.length > 0 && (
            <section className="space-y-4 pt-4">
               <div className="flex items-center gap-2 px-1 text-slate-400">
                  <History className="h-4 w-4" />
                  <h4 className="font-headline font-bold text-sm uppercase tracking-wider">Riwayat Analisis</h4>
               </div>
               <div className="space-y-3">
                  {analysisHistory.map((hist: any) => (
                    <Card key={hist.id} className="rounded-2xl border-none p-4 bg-white shadow-sm flex items-center justify-between">
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{hist.learningProfile}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-medium">
                            {hist.generatedAt ? new Date(hist.generatedAt.seconds * 1000).toLocaleDateString('id-ID') : 'Baru saja'}
                          </p>
                       </div>
                       <div className={cn("w-3 h-3 rounded-full shrink-0 ml-4", getRiskColor(hist.riskLevel))} />
                    </Card>
                  ))}
               </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
}
