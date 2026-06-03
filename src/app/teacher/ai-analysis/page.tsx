
'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Sparkles, 
  ArrowLeft, 
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
  LineChart,
  Database
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

  // AUDIT: Menggunakan Query yang sama persis dengan halaman /teacher/students
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: allStudents, loading: studentsLoading } = useCollection(studentsQuery);

  // Filtering cerdas: Menampilkan semua siswa jika kolom pencarian kosong
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];
    if (!searchTerm.trim()) return allStudents; // Tampilkan SEMUA siswa yang ada di collection users peran siswa
    
    return allStudents.filter(s => 
      s.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
        description: `Laporan edukasi untuk ${selectedStudent.nama} siap dibaca.`
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Gagal memproses analisis. Silakan coba lagi."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'aman': return { color: 'bg-green-500', text: '🟢 Aman' };
      case 'perhatian': return { color: 'bg-yellow-500', text: '🟡 Perhatian' };
      case 'risiko': return { color: 'bg-red-500', text: '🔴 Risiko' };
      default: return { color: 'bg-slate-400', text: 'Baru' };
    }
  };

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b flex items-center justify-between px-6 max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
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
            <h2 className="text-2xl font-headline font-bold text-slate-900">Analisis Siswa 🕵️‍♂️</h2>
            <p className="text-sm text-muted-foreground">Pilih siswa untuk mendapatkan wawasan belajar AI.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Cari nama siswa..." 
              className="pl-12 h-14 bg-white rounded-2xl border-none shadow-sm focus-visible:ring-2 ring-primary/20 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Debug Info Sementara */}
          <div className="bg-blue-900/5 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Database className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-bold text-blue-700 uppercase">Audit Firestore</span>
             </div>
             <div className="flex gap-3">
                <span className="text-[9px] font-bold">Col: users</span>
                <span className="text-[9px] font-bold">Found: {allStudents?.length || 0}</span>
             </div>
          </div>

          <div className="space-y-3">
            {studentsLoading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Menghubungkan ke Database...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <Card 
                  key={s.uid} 
                  className="rounded-3xl border-none p-4 bg-white shadow-sm hover:ring-2 ring-primary/40 transition-all cursor-pointer group"
                  onClick={() => setSelectedStudent(s)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                      <img 
                        src={`https://picsum.photos/seed/${s.uid}/100/100`} 
                        alt={s.nama} 
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100/100?text=S')}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{s.nama}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="bg-blue-50 text-primary text-[9px] font-bold px-2">Level {s.level || 1}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-[10px] font-bold text-slate-500">{s.poin || 0} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <AlertTriangle className="h-10 w-10 text-slate-200 mx-auto" />
                <div className="space-y-1">
                   <p className="text-sm font-bold text-slate-400 italic">Siswa tidak ditemukan.</p>
                   <p className="text-[10px] text-muted-foreground px-10">Pastikan siswa sudah terdaftar dengan peran 'siswa' di koleksi users.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-6">
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
                   <p className="text-[10px] text-muted-foreground font-bold">LV. {selectedStudent.level} • {selectedStudent.poin} XP</p>
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
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-headline font-bold text-slate-900">Siap Menganalisis?</h4>
                    <p className="text-xs text-muted-foreground px-6 leading-relaxed">
                      AI akan meninjau level, poin, {selectedStudent.scanCount} pindaian QR, dan riwayat aktivitas untuk memberikan laporan mendalam.
                    </p>
                  </div>
                  <Button 
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg gap-2"
                    onClick={handleGenerateAI}
                  >
                    <UserCheck className="h-5 w-5" /> Analisis Sekarang
                  </Button>
               </div>
            </Card>
          ) : isAnalyzing ? (
            <Card className="rounded-[2.5rem] border-none p-12 bg-white shadow-sm flex flex-col items-center justify-center space-y-6 min-h-[300px]">
               <div className="relative">
                  <Loader2 className="h-16 w-12 animate-spin text-primary" />
                  <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary/40" />
               </div>
               <div className="text-center space-y-2">
                  <h4 className="font-bold text-slate-900">Mengkonsultasikan Data...</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">ETHNO-AI sedang memproses laporan</p>
               </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-10">
               {/* 1. Ringkasan & Engagement */}
               <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-sm space-y-4 border-l-8 border-primary">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ringkasan Kemampuan</span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-slate-900">{analysisResult?.engagementLevel} Learner</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">"{analysisResult?.summary}"</p>
               </Card>

               {/* 2. Kelebihan & Kekurangan */}
               <div className="grid grid-cols-2 gap-4">
                  <Card className="rounded-3xl border-none p-5 bg-emerald-50 space-y-3">
                     <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><Star className="h-3 w-3 fill-current" /> Kelebihan</p>
                     <ul className="space-y-2">
                        {analysisResult?.strengths.map((s, i) => (
                          <li key={i} className="text-[9px] font-bold text-emerald-900 leading-tight flex gap-1">
                             <span className="text-emerald-400">✓</span> {s}
                          </li>
                        ))}
                     </ul>
                  </Card>
                  <Card className="rounded-3xl border-none p-5 bg-orange-50 space-y-3">
                     <p className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1"><Target className="h-3 w-3" /> Kekurangan</p>
                     <ul className="space-y-2">
                        {analysisResult?.weaknesses.map((w, i) => (
                          <li key={i} className="text-[9px] font-bold text-orange-900 leading-tight flex gap-1">
                             <span className="text-orange-300">•</span> {w}
                          </li>
                        ))}
                     </ul>
                  </Card>
               </div>

               {/* 3. Rekomendasi Guru */}
               <Card className="rounded-3xl border-none p-6 bg-slate-900 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Instruksi Untuk Guru</span>
                  </div>
                  <div className="space-y-3">
                     {analysisResult?.teacherRecommendations.map((r, i) => (
                        <div key={i} className="flex gap-3 items-start">
                           <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">{i + 1}</div>
                           <p className="text-xs font-medium leading-relaxed opacity-90">{r}</p>
                        </div>
                     ))}
                  </div>
               </Card>

               {/* 4. Rekomendasi Siswa */}
               <Card className="rounded-3xl border-none p-6 bg-blue-50 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Pesan Motivasi Siswa</span>
                  </div>
                  <div className="space-y-3">
                     {analysisResult?.studentRecommendations.map((r, i) => (
                        <p key={i} className="text-xs font-bold text-blue-900 leading-relaxed italic">"★ {r}"</p>
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
        </section>
      )}
    </div>
  );
}
