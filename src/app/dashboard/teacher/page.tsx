
'use client';

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  LogOut,
  Loader2,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useUser, useFirebase, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";

export default function TeacherDashboard() {
  const router = useRouter();
  const { auth, db } = useFirebase();
  const { user, profile, loading: authLoading } = useUser();

  // Query untuk mengambil semua siswa
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  // Proteksi rute
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (profile && profile.peran === 'siswa') {
      router.push("/dashboard/student");
    }
  }, [user, profile, authLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  // Statistik Kalkulasi
  const stats = useMemo(() => {
    if (!students) return { total: 0, avgXP: 0, completionRate: 0, needyCount: 0 };
    
    const total = students.length;
    const totalXP = students.reduce((acc, s) => acc + (s.poin || 0), 0);
    const avgXP = total > 0 ? Math.round(totalXP / total) : 0;
    const needyCount = students.filter(s => (s.poin || 0) < 50).length;
    
    // Simulasi rate penyelesaian (total modul selesai / total modul tersedia)
    const totalModulesDone = students.reduce((acc, s) => acc + (s.completedModules?.length || 0), 0);
    const completionRate = total > 0 ? Math.round((totalModulesDone / (total * 4)) * 100) : 0;

    return { total, avgXP, completionRate, needyCount };
  }, [students]);

  // Data untuk Grafik (Jumlah penyelesaian per modul)
  const chartData = useMemo(() => {
    if (!students) return [];
    const modules = {
      "Batik": "batik_nusantara",
      "Candi": "candi_nusantara",
      "Masjid": "masjid_al_akbar",
      "Permainan": "traditional_games"
    };

    return Object.entries(modules).map(([name, id]) => ({
      module: name,
      completions: students.filter(s => s.completedModules?.includes(id)).length
    }));
  }, [students]);

  const chartConfig = {
    completions: {
      label: "Siswa Selesai",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  if (authLoading || studentsLoading || !profile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Guru */}
      <aside className="w-64 border-r bg-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 h-16 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">EA</div>
          <span className="font-headline font-bold text-primary">Panel GURU</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20">
            <Users className="h-4 w-4" /> Daftar Siswa
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BarChart3 className="h-4 w-4" /> Analisis Belajar
          </Button>
        </nav>
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <Settings className="h-4 w-4" /> Pengaturan
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-auto">
        <header className="h-16 border-b bg-white px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <h1 className="font-headline font-bold text-lg">Ringkasan Aktivitas Siswa Realtime</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-bold border-primary text-primary">Guru: {profile.nama}</Badge>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {profile.nama.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Siswa", value: stats.total.toString(), sub: "Aktif di kelas", icon: Users },
              { title: "Rata-rata XP", value: stats.avgXP.toString(), sub: "Poin per siswa", icon: TrendingUp },
              { title: "Selesai Modul", value: `${stats.completionRate}%`, sub: "Progress total", icon: CheckCircle2 },
              { title: "Perlu Bantuan", value: stats.needyCount.toString(), sub: "Poin < 50 XP", icon: AlertCircle, destructive: stats.needyCount > 0 },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm overflow-hidden relative group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      <p className={`text-xs ${stat.destructive ? 'text-destructive font-bold' : 'text-green-600 font-medium'}`}>
                        {stat.sub}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                      <stat.icon className={`h-6 w-6 ${stat.destructive ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Chart Section */}
            <Card className="lg:col-span-7 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Sebaran Penyelesaian Modul</CardTitle>
                <CardDescription>Jumlah siswa yang berhasil menyelesaikan kuis akhir per modul</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] pb-6">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="module" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12, fontWeight: 500 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="completions" 
                        fill="var(--color-completions)" 
                        radius={[6, 6, 0, 0]} 
                        barSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* List Siswa */}
            <Card className="lg:col-span-5 border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Progres Siswa</CardTitle>
                  <CardDescription>Detail level dan poin terakhir</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">Export CSV</Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-bold">Siswa</TableHead>
                      <TableHead className="font-bold text-center">Level</TableHead>
                      <TableHead className="font-bold text-right">XP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students?.map((student, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                              {student.nama.charAt(0)}
                            </div>
                            <span className="truncate max-w-[120px]">{student.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-bold">Lv {student.level || 1}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-primary">
                          {student.poin || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Aktivitas Terbaru */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Aktivitas Modul Siswa</CardTitle>
              <CardDescription>Modul apa saja yang telah dikuasai oleh siswa Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students?.slice(0, 6).map((student, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border bg-white hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">{student.nama}</p>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aktif</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Modul Selesai:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {student.completedModules && student.completedModules.length > 0 ? (
                          student.completedModules.map((mod: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[10px] bg-slate-50">
                              {mod.split('_').join(' ')}
                            </Badge>
                          ))
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                            <Clock className="h-3 w-3" /> Belum ada modul selesai
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
