
'use client';

import { useState, useMemo } from "react";
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
  Star,
  Target,
  UserCheck,
  LineChart,
  Database
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, addDoc, serverTimestamp, limit, getDocs } from "firebase/firestore";
import { analyzeStudentIndividually, type StudentAnalysisOutput } from "@/ai/flows/student-individual-analysis";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// MENCEGAH CACHE: Wajib dinamis agar data siswa muncul
export const dynamic = "force-dynamic";

export default function TeacherAIAnalysisPage() {
  const { db } = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StudentAnalysisOutput | null>(null);

  // SOURCE DATA: 100% Identik dengan halaman Data Siswa
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  // Filter client-side untuk responsivitas pencarian
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchTerm.trim()) return students;
    return students.filter(s => 
      s.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleGenerateAI = async () => {
    if (!selectedStudent || !db) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Ambil riwayat aktivitas nyata untuk input AI
      const activitiesSnapshot = await getDocs(
        query(collection(db, "activities"), where("userId", "==", selectedStudent.uid), limit(20))
      );
      
      const studentActivities = activitiesSnapshot.docs.map(d => ({
        title: d.data().title,
        type: d.data().activityType,
        description: d.data().description,
        timestamp: d.data().timestamp?.toDate()?.toISOString()
      }));

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

      // Simpan ke Firestore
      await addDoc(collection(db, "student_ai_analysis"), {
        studentId: selectedStudent.uid,
        studentName: selectedStudent.nama,
        ...result,
        generatedAt: serverTimestamp()
      });

      toast({ title: "Analisis Selesai", description: `Laporan ${selectedStudent.nama} siap.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "AI Error", description: "Gagal memproses analisis." });
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
      </header>

      {/* PANEL AUDIT: Membuktikan sinkronisasi source data */}
      <div className="bg-slate-900 text-[10px] font-mono text-blue-400 p-3 rounded-xl space-y-1 shadow-inner">
        <div className="flex items-center gap-2 text-primary border-b border-slate-800 pb-1 mb-1">
           <Database className="h-3 w-3" />
           <span className="font-bold uppercase">Firestore Data Link</span>
        </div>
        <p>Collection: <span className="text-white">users</span></p>
        <p>Found Docs: <span className="text-yellow-400 font-bold">{students.length}</span></p>
        <p>Status: <span className={students.length > 0 ? "text-green-400" : "text-red-400"}>{students.length > 0 ? "Data Synced" : "Searching..."}</span></p>
      </div>

      {!selectedStudent ? (
        <section className="space-y-4">
          <div className="px-1">
            <h2 className="text-2xl font-headline font-bold text-slate-900">Analisis Siswa 🕵️‍♂️</h2>
            <p className="text-sm text-muted-foreground">Pilih siswa untuk memulai konsultasi AI.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Cari nama siswa..." 
              className="pl-12 h-14 bg-white rounded-2xl border-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-2">
            {studentsLoading ? (
              <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((s) => (
                <Card 
                  key={s.uid} 
                  className="rounded-3xl border-none p-4 bg-white shadow-sm hover:ring-2 ring-primary/40 transition-all cursor-pointer group active:scale-[0.98]"
                  onClick={() => setSelectedStudent(s)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white">
                      <img src={`https://picsum.photos/seed/${s.uid}/100/100`} alt={s.nama} onError={(e) => (e.currentTarget.src = 'https://placehold.co/100/100?text=S')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{s.nama}</h4>
                      <p className="text-[10px] text-slate-500 font-bold">LV. {s.level || 1} • {s.poin || 0} XP</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </Card>
              ))
            ) : (
              <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <Database className="h-10 w-10 text-slate-100 mx-auto" />
                <p className="text-sm font-bold text-slate-400">Siswa tidak ditemukan.</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-6 animate-in slide-in-from-right duration-500">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                   <img src={`https://picsum.photos/seed/${selectedStudent.uid}/100/100`} alt="Siswa" />
                </div>
                <div>
                   <h3 className="font-headline font-bold text-slate-900 leading-tight">{selectedStudent.nama}</h3>
                   <Button variant="link" className="p-0 h-auto text-[10px] font-bold text-primary uppercase" onClick={() => { setSelectedStudent(null); setAnalysisResult(null); }}>Ganti Siswa</Button>
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
                  <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto"><Sparkles className="h-10 w-10 text-primary" /></div>
                  <h4 className="text-xl font-headline font-bold text-slate-900">Analisis ETHNO-AI</h4>
                  <p className="text-xs text-muted-foreground px-6 leading-relaxed">Tinjau progres belajar {selectedStudent.nama} secara mendalam.</p>
                  <Button className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg gap-2" onClick={handleGenerateAI}>
                    <UserCheck className="h-5 w-5" /> Analisis Siswa
                  </Button>
               </div>
            </Card>
          ) : isAnalyzing ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
               <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">Memproses Laporan AI...</p>
            </div>
          ) : (
            <div className="space-y-6 pb-10">
               <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-sm space-y-4 border-l-8 border-primary">
                  <div className="flex items-center gap-2"><LineChart className="h-4 w-4 text-primary" /><span className="text-[10px] font-bold text-primary uppercase tracking-widest">Ringkasan Kemampuan</span></div>
                  <h3 className="text-xl font-headline font-bold text-slate-900">{analysisResult?.engagementLevel} Learner</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">"{analysisResult?.summary}"</p>
               </Card>

               <div className="grid grid-cols-2 gap-4">
                  <Card className="rounded-3xl border-none p-5 bg-emerald-50 space-y-3">
                     <p className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1"><Star className="h-3 w-3 fill-current" /> Kelebihan</p>
                     <ul className="space-y-1">{analysisResult?.strengths.map((s, i) => (<li key={i} className="text-[9px] font-bold text-emerald-900 flex gap-1">✓ {s}</li>))}</ul>
                  </Card>
                  <Card className="rounded-3xl border-none p-5 bg-orange-50 space-y-3">
                     <p className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1"><Target className="h-3 w-3" /> Kekurangan</p>
                     <ul className="space-y-1">{analysisResult?.weaknesses.map((w, i) => (<li key={i} className="text-[9px] font-bold text-orange-900 flex gap-1">• {w}</li>))}</ul>
                  </Card>
               </div>

               <Card className="rounded-3xl border-none p-6 bg-slate-900 text-white space-y-4 shadow-xl">
                  <div className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-primary" /><span className="text-[10px] font-bold uppercase tracking-widest text-primary">Instruksi Untuk Guru</span></div>
                  <div className="space-y-2">{analysisResult?.teacherRecommendations.map((r, i) => (<p key={i} className="text-xs font-medium opacity-90">{i + 1}. {r}</p>))}</div>
               </Card>

               <Card className="rounded-3xl border-none p-6 bg-blue-50 space-y-4">
                  <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-600" /><span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Pesan Motivasi Siswa</span></div>
                  <div className="space-y-2">{analysisResult?.studentRecommendations.map((r, i) => (<p key={i} className="text-xs font-bold text-blue-900 italic">"★ {r}"</p>))}</div>
               </Card>

               <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2 border-slate-200" onClick={() => { setAnalysisResult(null); setSelectedStudent(null); }}>Tutup Laporan</Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
