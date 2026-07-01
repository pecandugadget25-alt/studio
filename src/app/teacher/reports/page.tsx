'use client';

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Loader2,
  Sparkles,
  BookOpen,
  Camera,
  Star,
  Zap,
  TrendingUp,
  FileText,
  LayoutGrid,
  CircleDot
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { analyzeClassPerformance, type ClassAnalysisOutput } from "@/ai/flows/class-performance-analysis";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import { COMIC_LIBRARY } from "@/lib/comic-library";

export const dynamic = "force-dynamic";

export default function TeacherReportsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [aiInsight, setAiInsight] = useState<ClassAnalysisOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Guard: Hanya Guru/Admin
  useEffect(() => {
    if (!authLoading && profile && profile.peran === 'siswa') {
      router.push("/");
    }
  }, [profile, authLoading, router]);

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading } = useCollection(studentsQuery);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return null;
    
    const total = students.length;
    const totalXP = students.reduce((acc, s) => acc + (Number(s.poin) || 0), 0);
    const avgXP = Math.round(totalXP / total);
    const totalBadges = students.reduce((acc, s) => acc + (s.badges?.length || 0), 0);
    const activeSiswa = students.filter(s => (s.poin || 0) > 0).length;
    
    const materialStats = COMIC_LIBRARY.map((comic, index) => ({
      id: comic.id,
      name: comic.title,
      count: students.filter((s) => s.completedComics?.includes(comic.id)).length,
      color: ['bg-primary', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-sky-500'][index] ?? 'bg-primary',
      icon: BookOpen,
    })).sort((a, b) => b.count - a.count);

    // Status Kelas
    const statusCounts = {
      Aktif: students.filter(s => (s.poin || 0) > 100).length,
      Orientasi: students.filter(s => (s.poin || 0) > 0 && (s.poin || 0) <= 100).length,
      Perhatian: students.filter(s => (s.poin || 0) === 0).length
    };

    return { total, totalXP, avgXP, totalBadges, activeSiswa, materialStats, statusCounts };
  }, [students]);

  useEffect(() => {
    if (!stats || aiInsight || aiLoading) {
      return;
    }

    async function getInsight() {
      setAiLoading(true);
      try {
        if (!stats) {
          return;
        }

        const modMap: Record<string, number> = {};
        stats.materialStats.forEach((m) => {
          modMap[m.name] = m.count;
        });

        const result = await analyzeClassPerformance({
          totalStudents: stats.total,
          activeStudents: stats.activeSiswa,
          totalXP: stats.totalXP,
          totalBadges: stats.totalBadges,
          averageXP: stats.avgXP,
          materialStats: modMap,
          unfinishedCount: stats.statusCounts.Perhatian
        });
        setAiInsight(result);
      } catch (e) {
        console.error(e);
      } finally {
        setAiLoading(false);
      }
    }

    void getInsight();
  }, [stats, aiInsight, aiLoading]);

  // Export handlers
  const handleExportExcel = () => {
    if (!students?.length) return;
    setIsExportingExcel(true);
    const data = students.map((s) => ({
      "Nama": s.nama,
      "Level": s.level || 1,
      "XP": s.poin || 0,
      "Lencana": s.badges?.length || 0,
      "Materi Selesai": s.completedComics?.join(", ") || "-"
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "Laporan_ETHNO_ARITH.xlsx");
    setIsExportingExcel(false);
  };

  const handleExportPdf = () => {
    if (!students?.length) return;
    setIsExportingPdf(true);
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Nama", "Level", "XP", "Lencana", "Materi Selesai"]],
      body: students.map((s) => [s.nama, s.level || 1, s.poin || 0, s.badges?.length || 0, s.completedComics?.join(", ") || "-"]),
    });
    doc.save("Laporan_ETHNO_ARITH.pdf");
    setIsExportingPdf(false);
  };

  if (authLoading || loading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl space-y-6 bg-slate-50/50 px-4 pb-28 pt-20 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-40 -mx-4 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">LAPORAN KELAS</h1>
        </div>
      </div>

      {/* AI INSIGHT SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-headline font-bold text-sm uppercase tracking-wider">Laporan Naratif AI</h3>
        </div>
        <Card className="rounded-[2.5rem] border-none bg-white p-6 shadow-sm space-y-6">
          {aiLoading ? (
             <div className="py-10 flex flex-col items-center gap-2">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menyusun Analisis...</p>
             </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Interpretasi Utama</p>
                <p className="text-sm leading-relaxed text-slate-700 font-medium italic">"{aiInsight?.mainInsight}"</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-[10px] font-bold uppercase">Kekuatan Kolektif</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiInsight?.strengths.map((s, i) => (
                    <Badge key={i} className="bg-emerald-50 text-emerald-700 border-none text-[9px] font-bold px-3 py-1 rounded-lg">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <Zap className="h-4 w-4 fill-current" />
                  <span className="text-[10px] font-bold uppercase">Rekomendasi Strategis</span>
                </div>
                <ul className="space-y-2">
                  {aiInsight?.recommendations.map((r, i) => (
                    <li key={i} className="text-[11px] font-bold text-slate-600 flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* RINGKASAN AKTIVITAS KELAS */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider px-1 flex items-center gap-2 text-slate-900">
          <LayoutGrid className="h-4 w-4 text-primary" /> Ringkasan Aktivitas
        </h3>
        <Card className="rounded-[2.5rem] border-none bg-slate-900 text-white p-6 shadow-lg overflow-hidden relative">
          <div className="relative z-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total XP</p>
              <h4 className="text-3xl font-bold text-white">{stats?.totalXP.toLocaleString()}</h4>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rerata XP</p>
              <h4 className="text-3xl font-bold text-primary">{stats?.avgXP}</h4>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lencana</p>
              <h4 className="text-3xl font-bold text-yellow-500">{stats?.totalBadges}</h4>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aktivitas AR</p>
              <h4 className="text-3xl font-bold text-purple-400">{(stats?.totalBadges || 0) * 2}</h4>
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </Card>
      </section>

      {/* Materi terpopuler */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider px-1 flex items-center gap-2 text-slate-900">
          <TrendingUp className="h-4 w-4 text-primary" /> Performa Materi
        </h3>
        <Card className="rounded-[2rem] border-none p-6 bg-white shadow-sm space-y-6">
          {stats?.materialStats.map((mod) => (
            <div key={mod.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm", mod.color)}>
                     <mod.icon className="h-4 w-4" />
                   </div>
                   <span className="text-xs font-bold text-slate-700">{mod.name}</span>
                </div>
                <Badge variant="secondary" className="text-[9px] font-bold px-2">{mod.count} Siswa</Badge>
              </div>
              <Progress value={(mod.count / (stats?.total || 1)) * 100} className="h-2" />
            </div>
          ))}
        </Card>
      </section>

      {/* STATUS KELAS */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider px-1 flex items-center gap-2 text-slate-900">
          <CircleDot className="h-4 w-4 text-primary" /> Kesiapan Siswa
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
           {[
             { label: "Aktif", val: stats?.statusCounts.Aktif, color: "bg-emerald-50 text-emerald-600" },
             { label: "Orientasi", val: stats?.statusCounts.Orientasi, color: "bg-blue-50 text-blue-600" },
             { label: "Perhatian", val: stats?.statusCounts.Perhatian, color: "bg-red-50 text-red-600" },
           ].map((st, i) => (
             <Card key={i} className="border-none shadow-sm rounded-3xl p-4 text-center space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{st.label}</p>
                <p className={cn("text-xl font-bold", st.color.split(' ')[1])}>{st.val}</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase">Siswa</p>
             </Card>
           ))}
        </div>
      </section>

      {/* ACTIONS */}
      <section className="space-y-3 pt-4 pb-12">
        <Button 
          className="w-full h-14 rounded-3xl font-bold gap-3 bg-slate-900 text-white shadow-lg"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
        >
          {isExportingExcel ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
          Export Detail Performa (XLSX)
        </Button>
        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">Laporan dihasilkan secara realtime dari Firestore</p>
      </section>
    </div>
  );
}
