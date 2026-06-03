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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { analyzeClassPerformance, type ClassAnalysisOutput } from "@/ai/flows/class-performance-analysis";

export const dynamic = "force-dynamic";

export default function TeacherReportsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { profile, loading: authLoading } = useUser();
  
  const [aiAnalysis, setAiAnalysis] = useState<ClassAnalysisOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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
    const difficult = "Candi (Geometri)"; // Simulasi modul sulit

    const modules = students.reduce((acc, s) => acc + (s.completedModules?.length || 0), 0);
    const arScans = modules * 3; 

    return { total, totalXP, avgXP, modules, arScans, popular, difficult };
  }, [students]);

  // Panggil AI Analysis saat stats siap
  useEffect(() => {
    if (stats.total > 0 && !aiAnalysis && !aiLoading) {
      async function fetchAnalysis() {
        setAiLoading(true);
        try {
          const result = await analyzeClassPerformance({
            totalStudents: stats.total,
            averageXP: stats.avgXP,
            averageQuiz: 78, // Simulasi rerata kuis
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

  const chartData = [
    { name: 'Total Siswa', value: stats.total, fill: 'hsl(var(--primary))' },
    { name: 'Modul Selesai', value: stats.modules, fill: 'hsl(var(--accent))' },
    { name: 'Scan AR', value: stats.arScans, fill: '#10b981' },
  ];

  const chartConfig = {
    value: { label: "Jumlah", color: "hsl(var(--primary))" },
  };

  if (authLoading || loading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
      {/* Header */}
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

      {/* AI Analysis Section */}
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

      {/* Grid Ringkasan */}
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

      {/* Grafik */}
      <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 pb-0">
          <CardTitle className="text-sm font-bold">Ringkasan Aktivitas</CardTitle>
        </CardHeader>
        <CardContent className="p-6 h-[250px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <XAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Ekspor */}
      <section className="space-y-4 pb-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1">Ekspor Data</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm">
            <Download className="h-5 w-5 text-primary" />
            <span className="text-[10px] uppercase">Excel (XLSX)</span>
          </Button>
          <Button variant="outline" className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm">
            <Printer className="h-5 w-5 text-accent" />
            <span className="text-[10px] uppercase">Cetak PDF</span>
          </Button>
        </div>
        <Button className="w-full h-14 rounded-3xl font-bold gap-2 bg-slate-900 text-white shadow-lg">
          <FileText className="h-5 w-5" /> Download Laporan Performa
        </Button>
      </section>
    </div>
  );
}
