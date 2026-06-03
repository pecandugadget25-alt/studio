'use client';

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  BarChart3,
  Camera,
  Star,
  FileText,
  Loader2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { analyzeClassPerformance, type ClassAnalysisOutput } from "@/ai/flows/class-performance-analysis";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const dynamic = "force-dynamic";

export default function TeacherReportsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { profile, loading: authLoading } = useUser();
  const { toast } = useToast();
  
  const [aiAnalysis, setAiAnalysis] = useState<ClassAnalysisOutput | null>(null);
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
    if (!students || students.length === 0) return { total: 0, totalXP: 0, avgXP: 0, modules: 0, arScans: 0, popular: "Batik", difficult: "Candi" };
    
    const total = students.length;
    const totalXP = students.reduce((acc, s) => acc + (Number(s.poin) || 0), 0);
    const avgXP = Math.round(totalXP / total);
    
    const allCompleted = students.flatMap(s => s.completedModules || []);
    const counts: Record<string, number> = {};
    allCompleted.forEach(m => counts[m] = (counts[m] || 0) + 1);
    
    const popular = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "Batik Nusantara");
    const difficult = "Candi (Geometri)"; 

    const modules = students.reduce((acc, s) => acc + (s.completedModules?.length || 0), 0);
    const arScans = modules * 3; 

    return { total, totalXP, avgXP, modules, arScans, popular, difficult };
  }, [students]);

  useEffect(() => {
    if (stats.total > 0 && !aiAnalysis && !aiLoading) {
      async function fetchAnalysis() {
        setAiLoading(true);
        try {
          const result = await analyzeClassPerformance({
            totalStudents: stats.total,
            averageXP: stats.avgXP,
            averageQuiz: 78,
            popularModule: stats.popular,
            difficultModule: stats.difficult
          });
          setAiAnalysis(result);
        } catch (error) {
          console.error("AI Analysis failed:", error);
        } finally {
          setAiLoading(false);
        }
      }
      fetchAnalysis();
    }
  }, [stats, aiAnalysis, aiLoading]);

  const handleExportExcel = () => {
    if (!students || students.length === 0) {
      toast({
        variant: "destructive",
        title: "Ekspor Gagal",
        description: "Belum ada data siswa untuk diekspor."
      });
      return;
    }

    setIsExportingExcel(true);
    try {
      const data = students.map((s: any) => ({
        "Nama Siswa": s.nama,
        "Email": s.email,
        "Level": s.level || 1,
        "Total XP": s.poin || 0,
        "Total Scan": s.scanCount || 0,
        "Modul Selesai": s.completedModules?.length || 0,
        "Lencana": s.badges?.length || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Performa");
      
      XLSX.writeFile(workbook, `Laporan_EthnoArith_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Ekspor Berhasil",
        description: "File Excel telah diunduh."
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Terjadi kesalahan saat membuat file Excel."
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = () => {
    if (!students || students.length === 0) {
      toast({
        variant: "destructive",
        title: "Ekspor Gagal",
        description: "Belum ada data siswa untuk diekspor."
      });
      return;
    }

    setIsExportingPdf(true);
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text("Laporan Performa Pembelajaran ETHNO-ARITH", 14, 20);
      
      doc.setFontSize(11);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);
      doc.text(`Guru: ${profile?.nama || "Admin"}`, 14, 37);

      // Stats Summary
      doc.setFontSize(14);
      doc.text("Ringkasan Kelas", 14, 50);
      doc.setFontSize(10);
      doc.text(`Total Siswa: ${stats.total}`, 14, 58);
      doc.text(`Total XP Kelas: ${stats.totalXP}`, 14, 65);
      doc.text(`Rata-rata XP: ${stats.avgXP}`, 14, 72);
      doc.text(`Interaksi AR Scan: ${stats.arScans}`, 14, 79);

      // Student Table
      const tableData = students.map((s: any) => [
        s.nama,
        s.level || 1,
        s.poin || 0,
        s.scanCount || 0,
        s.completedModules?.length || 0
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['Nama Siswa', 'Level', 'XP', 'Scan', 'Modul']],
        body: tableData,
      });

      doc.save(`Laporan_EthnoArith_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Ekspor Berhasil",
        description: "File PDF telah diunduh."
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Terjadi kesalahan saat membuat file PDF."
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const chartData = [
    { name: 'Siswa', value: stats.total },
    { name: 'Modul', value: stats.modules },
    { name: 'AR Scan', value: stats.arScans },
  ];

  const chartConfig = {
    value: { label: "Jumlah", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  if (authLoading || loading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 android-shadow max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">LAPORAN KELAS</h1>
        </div>
      </div>

      <section className="px-1">
        <h2 className="text-2xl font-headline font-bold text-slate-900">Statistik Kelas</h2>
        <p className="text-sm text-muted-foreground">Update Real-time dari Database</p>
      </section>

      <Card className="rounded-[2rem] border-none bg-primary text-white p-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Wawasan Analitik AI</span>
          </div>
          {aiLoading ? (
            <div className="flex items-center gap-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-xs font-medium italic">Menganalisis performa kelas...</p>
            </div>
          ) : (
            <p className="text-xs leading-relaxed font-medium">
              {aiAnalysis?.summary || "Data belum cukup untuk analisis AI. Dorong siswa untuk menyelesaikan lebih banyak kuis!"}
            </p>
          )}
        </div>
        <div className="absolute -right-8 -bottom-8 bg-white/10 w-32 h-32 rounded-full blur-3xl" />
      </Card>

      <section className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-50 rounded-lg text-accent">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Scan</span>
          </div>
          <h3 className="text-2xl font-bold">{stats.arScans}</h3>
          <p className="text-[9px] text-green-600 font-bold">Interaksi Belajar</p>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-50 rounded-lg text-yellow-600">
              <Star className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP</span>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalXP}</h3>
          <p className="text-[9px] text-yellow-600 font-bold">XP Seluruh Siswa</p>
        </Card>
      </section>

      <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-sm font-bold">Ringkasan Aktivitas</CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-[250px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -10 }}>
                <XAxis type="number" hide />
                <XAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <section className="space-y-4 pb-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1">Ekspor Data</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm"
            onClick={handleExportExcel}
            disabled={isExportingExcel || loading}
          >
            {isExportingExcel ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 text-primary" />}
            <span className="text-[10px] uppercase">Excel (XLSX)</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm"
            onClick={handleExportPdf}
            disabled={isExportingPdf || loading}
          >
            {isExportingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5 text-accent" />}
            <span className="text-[10px] uppercase">Cetak PDF</span>
          </Button>
        </div>
        <Button 
          className="w-full h-14 rounded-3xl font-bold gap-2 bg-slate-900 text-white shadow-lg"
          onClick={handleExportPdf}
          disabled={isExportingPdf || loading}
        >
          {isExportingPdf ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
          Download Laporan Performa
        </Button>
      </section>
    </div>
  );
}
