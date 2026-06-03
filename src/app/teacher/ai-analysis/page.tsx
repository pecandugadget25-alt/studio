'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  History,
  ShieldCheck,
  UserCheck,
  LineChart
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, addDoc, serverTimestamp, orderBy, limit, getDocs } from "firebase/firestore";
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

  // Sync dengan koleksi users peran siswa (Sama dengan Data Siswa)
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: allStudents, loading: studentsLoading } = useCollection(studentsQuery);

  // Filtering cerdas untuk dropdown pencarian
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];
    if (!searchTerm.trim()) return allStudents.slice(0, 5); // Tampilkan 5 terbaru jika belum ngetik
    
    return allStudents.filter(s => 
      s.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.uid?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [allStudents, searchTerm]);

  // Riwayat analisis terakhir untuk siswa yang dipilih
  const historyQuery = useMemo(() => {
    if (!db || !selectedStudent) return null;
    return query(
      collection(db, "student_ai_analysis"),
      where("studentId", "==", selectedStudent.uid),
      orderBy("generatedAt", "desc"),
      limit(3)
    );
  }, [db, selectedStudent?.uid]);

  const { data: analysisHistory } = useCollection(historyQuery);

  const handleGenerateAI = async () => {
    if (!selectedStudent || !db) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Ambil aktivitas asli dari database untuk konteks AI
      const activitiesSnapshot = await getDocs(
        query(collection(db, "activities"), where("userId", "==", selectedStudent.uid), limit(20))
      );
      
      const studentActivities = activitiesSnapshot.docs.map(d => ({
        title: d.data().title,
        type: d.data().activityType,
        description: d.data().description,
        timestamp: d.data().timestamp?.toDate()?.toISOString()
      }));

      // Panggil AI Flow
      const result = await analyzeStudentIndividually({
        nama: selectedStudent.nama,
        level: selectedStudent.level || 1,
        poin: selectedStudent.poin || 0,
        scanCount: selectedStudent.scanCount || 0,
        completedModules: selectedStudent.completedModules || [],
        completedComics: selectedStudent.completedComics || [],
        completedVideos: selectedStudent.completedVideos || [],
        recentActivities: studentActivities
      });

      // Validasi data cukup
      if ((selectedStudent.poin || 0) < 5 && selectedStudent.scanCount === 0) {
        toast({
          variant: "destructive",
          title: "Data Tidak Cukup",
          description: "Siswa ini belum memiliki cukup aktivitas untuk dianalisis secara akurat."
        });
        setIsAnalyzing(false);
        return;
      }

      setAnalysisResult(result);

      // Simpan ke riwayat Firestore
      await addDoc(collection(db, "student_ai_analysis"), {
        studentId: selectedStudent.uid,
        studentName: selectedStudent.nama,
        ...result,
        generatedAt: serverTimestamp()
      });

      toast({
        title: "Analisis Selesai",
        description: `Wawasan baru untuk ${selectedStudent.nama} telah tersedia.`
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Gagal",
        description: "Gagal menghubungkan ke ETHNO-AI. Silakan coba lagi."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'aman': return { color: 'bg-green-500', icon: ShieldCheck, text: 'Aman' };
      case 'perhatian': return { color: 'bg-yellow-500', icon: AlertTriangle, text: 'Perhatian' };
      case 'risiko': return { color: 'bg-red-500', icon: Zap, text: 'Risiko Tinggi' };
      default: return { color: 'bg-slate-400', icon: BrainCircuit, text: 'Baru' };
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
          <h1 className="font-headline font-bold text-lg text-primary">AI ANALISIS</h1>
        </div>
        <div className="bg-primary/10 p-2 rounded-xl">
           <BrainCircuit className="h-5 w-5 text-primary" />
        </div>
      </header>

      {!selectedStudent ? (
        <section className="space-y-4">
          <div className="px-1">
            <h2 className="text-2xl font-headline font-bold text-slate-900">Cari Siswa 🕵️‍♂️</h2>
            <p className="text-sm text-muted-foreground">Ketik nama atau email siswa untuk memulai analisis.</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Contoh: Arie test2..." 
              className="pl-12 h-14 bg-white rounded-2xl border-none shadow-sm focus-visible:ring-2 ring-primary/20 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              {searchTerm ? 'Hasil Pencarian' : 'Daftar Siswa Terbaru'}
            </p>
            {studentsLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <Card 
                  key={s.uid} 
                  className="rounded-3xl border-none p-4 bg-white shadow-sm hover:ring-2 ring-primary/40 transition-all cursor-pointer group active:scale-[0.98]"
                  onClick={() => {
                    setSelectedStudent(s);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                      <img 
                        src={`https://picsum.photos/seed/${s.uid}/100/100`} 
                        alt={s.nama} 
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100/100?text=S')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{s.nama}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-blue-50 text-primary text-[9px] uppercase font-bold px-2">Lv {s.level || 1}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-[10px] font-bold text-slate-500">{s.poin || 0} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-10 text-center space-y-2">
                <AlertTriangle className="h-8 w-8 text-slate-200 mx-auto" />
                <p className="text-sm text-slate-400 italic">Siswa tidak ditemukan.</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          {/* Header Siswa Terpilih */}
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                   <img 
                    src={`https://picsum.photos/seed/${selectedStudent.uid}/100/100`} 
                    alt="Siswa" 
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/100/100?text=S')}
                   />
                </div>
                <div>
                   <h3 className="font-headline font-bold text-slate-900 leading-tight">{selectedStudent.nama}</h3>
                   <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary uppercase" onClick={() => {
                     setSelectedStudent(null);
                     setAnalysisResult(null);
                   }}>Ganti Siswa</Button>
                </div>
             </div>
             {analysisResult && (
               <Badge className={cn("px-4 py-1.5 rounded-full uppercase text-[10px] font-bold shadow-sm", getRiskStyles(analysisResult.riskLevel).color)}>
                  {getRiskStyles(analysisResult.riskLevel).text}
               </Badge>
             )}
          </div>

          {!analysisResult && !isAnalyzing ? (
            <Card className="rounded-[2rem] border-none bg-white p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto transform rotate-6">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-headline font-bold text-slate-900">Mulai Analisis?</h4>
                    <p className="text-xs text-muted-foreground px-6 leading-relaxed">
                      AI akan meninjau level, poin, {selectedStudent.scanCount} pindaian QR, dan log aktivitas {selectedStudent.nama} untuk memberikan rekomendasi pengajaran.
                    </p>
                  </div>
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 gap-2"
                    onClick={handleGenerateAI}
                  >
                    <UserCheck className="h-5 w-5" /> Analisis Siswa
                  </Button>
               </div>
               <div className="absolute -right-8 -top-8 bg-slate-50 w-32 h-32 rounded-full" />
            </Card>
          ) : isAnalyzing ? (
            <Card className="rounded-[2.5rem] border-none p-12 bg-white shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[300px]">
               <div className="relative">
                  <Loader2 className="h-16 w-12 animate-spin text-primary" />
                  <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary/40" />
               </div>
               <div className="text-center space-y-2">
                  <h4 className="font-bold text-slate-900">ETHNO-AI Sedang Berpikir...</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Menganalisis Progres Belajar</p>
               </div>
            </Card>
          ) : (
            /* HASIL LAPORAN AI */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-10">
               {/* A. Ringkasan Kemampuan */}
               <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-sm space-y-4 border-l-8 border-primary">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                       <LineChart className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ringkasan Kemampuan</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-slate-900">{analysisResult?.engagementLevel} Explorer</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">"{analysisResult?.summary}"</p>
               </Card>

               {/* B & C. Kelebihan & Kekurangan */}
               <div className="grid grid-cols-2 gap-4">
                  <Card className="rounded-3xl border-none p-5 bg-emerald-50 space-y-3">
                     <div className="flex items-center gap-2 text-emerald-600">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-[10px] font-bold uppercase">Kelebihan</span>
                     </div>
                     <ul className="space-y-2">
                        {analysisResult?.strengths.map((s, i) => (
                          <li key={i} className="text-[10px] font-bold text-emerald-900 flex gap-2">
                             <span className="text-emerald-400 shrink-0">✓</span> {s}
                          </li>
                        ))}
                     </ul>
                  </Card>
                  <Card className="rounded-3xl border-none p-5 bg-orange-50 space-y-3">
                     <div className="flex items-center gap-2 text-orange-600">
                        <Target className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase">Kekurangan</span>
                     </div>
                     <ul className="space-y-2">
                        {analysisResult?.weaknesses.map((w, i) => (
                          <li key={i} className="text-[10px] font-bold text-orange-900 flex gap-2">
                             <span className="text-orange-300 shrink-0">•</span> {w}
                          </li>
                        ))}
                     </ul>
                  </Card>
               </div>

               {/* F. Rekomendasi Guru */}
               <Card className="rounded-3xl border-none p-6 bg-slate-900 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Panduan Untuk Guru</span>
                  </div>
                  <div className="space-y-3">
                     {analysisResult?.teacherRecommendations.map((r, i) => (
                        <div key={i} className="flex gap-3 items-start">
                           <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">
                              {i + 1}
                           </div>
                           <p className="text-xs font-medium leading-relaxed opacity-90">{r}</p>
                        </div>
                     ))}
                  </div>
               </Card>

               {/* G. Rekomendasi Siswa */}
               <Card className="rounded-3xl border-none p-6 bg-blue-50 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Pesan Untuk Siswa</span>
                  </div>
                  <div className="space-y-3">
                     {analysisResult?.studentRecommendations.map((r, i) => (
                        <div key={i} className="flex gap-3 items-start">
                           <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold">
                              ★
                           </div>
                           <p className="text-xs font-bold text-blue-900 leading-relaxed italic">"{r}"</p>
                        </div>
                     ))}
                  </div>
               </Card>

               <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl font-bold border-2 border-slate-200 text-slate-500 hover:bg-slate-50"
                onClick={() => setAnalysisResult(null)}
               >
                 Analisis Ulang
               </Button>
            </div>
          )}

          {/* Riwayat Terakhir Mini */}
          {analysisHistory && analysisHistory.length > 0 && (
            <section className="space-y-4 pt-4 border-t">
               <div className="flex items-center gap-2 px-1 text-slate-400">
                  <History className="h-4 w-4" />
                  <h4 className="font-headline font-bold text-xs uppercase tracking-widest">Riwayat Analisis Siswa</h4>
               </div>
               <div className="space-y-3">
                  {analysisHistory.map((hist: any) => (
                    <Card key={hist.id} className="rounded-2xl border-none p-4 bg-white shadow-sm flex items-center justify-between">
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-900 truncate uppercase">{hist.engagementLevel} PROFILE</p>
                          <p className="text-[9px] text-muted-foreground font-medium">
                            {hist.generatedAt ? new Date(hist.generatedAt.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
                          </p>
                       </div>
                       <div className={cn("w-3 h-3 rounded-full shrink-0 ml-4 shadow-sm", getRiskStyles(hist.riskLevel).color)} />
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
