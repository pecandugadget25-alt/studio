
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ArrowLeft, 
  Bell, 
  Download, 
  Printer, 
  TrendingUp, 
  BarChart3,
  BookOpen,
  Camera,
  Users,
  PieChart as PieChartIcon
} from "lucide-react";
import Link from "next/link";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, Cell, Pie, PieChart } from "recharts";

const MODUL_DATA = [
  { name: 'Batik', count: 45, fill: 'hsl(var(--accent))' },
  { name: 'Candi', count: 32, fill: 'hsl(var(--primary))' },
  { name: 'Games', count: 50, fill: 'hsl(var(--destructive))' },
  { name: 'Masjid', count: 28, fill: '#10b981' },
];

const PERFORMANCE_DATA = [
  { week: 'W1', score: 75 },
  { week: 'W2', score: 82 },
  { week: 'W3', score: 78 },
  { week: 'W4', score: 88 },
];

export default function TeacherReportsPage() {
  const chartConfig = {
    count: { label: "Penyelesaian", color: "hsl(var(--primary))" },
    score: { label: "Rata-rata Nilai", color: "hsl(var(--accent))" },
  };

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto">
      {/* App Bar Guru */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 android-shadow max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">LAPORAN KELAS</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 relative">
            <Bell className="h-5 w-5 text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>

      {/* Header */}
      <section className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-slate-900">Statistik Kelas</h2>
          <p className="text-sm text-muted-foreground">Periode: Februari 2024</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-2xl">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
      </section>

      {/* Grid Summary */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-50 rounded-lg text-accent">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Scan</span>
          </div>
          <h3 className="text-2xl font-bold">1,284</h3>
          <p className="text-[9px] text-green-600 font-bold">+12% dari bulan lalu</p>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg text-primary">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Komik Selesai</span>
          </div>
          <h3 className="text-2xl font-bold">452</h3>
          <p className="text-[9px] text-blue-600 font-bold">Aktif 85% siswa</p>
        </Card>
      </section>

      {/* Charts Section */}
      <section className="space-y-4">
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" /> Distribusi Modul
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[250px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MODUL_DATA} layout="vertical" margin={{ left: -20 }}>
                  <XAxis type="number" hide />
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" /> Performa Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[200px]">
             <ChartContainer config={chartConfig} className="h-full w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PERFORMANCE_DATA}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="score" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Export Section */}
      <section className="space-y-4 pb-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1">Ekspor Data</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold">
            <Download className="h-5 w-5 text-primary" />
            <span className="text-[10px] uppercase">Excel (XLSX)</span>
          </Button>
          <Button variant="outline" className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold">
            <Printer className="h-5 w-5 text-accent" />
            <span className="text-[10px] uppercase">Cetak PDF</span>
          </Button>
        </div>
        <Button className="w-full h-14 rounded-3xl font-bold gap-2 bg-slate-900">
          <FileText className="h-5 w-5" /> Generate Report Lengkap
        </Button>
      </section>
    </div>
  );
}
