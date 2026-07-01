
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
  Clock,
  BookOpen,
  Menu
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useUser, useFirebase, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
    if (!students) return { total: 0, avgXP: 0, completionRate: 0, needyCount: 0, comicReads: 0 };
    
    const total = students.length;
    const totalXP = students.reduce((acc, s) => acc + (s.poin || 0), 0);
    const avgXP = total > 0 ? Math.round(totalXP / total) : 0;
    const needyCount = students.filter(s => (s.poin || 0) < 50).length;
    
    const totalComicReads = students.reduce((acc, s) => acc + (s.completedComics?.length || 0), 0);
    
    const totalMaterialsDone = students.reduce((acc, s) => acc + (s.completedComics?.length || 0), 0);
    const completionRate = total > 0 ? Math.round((totalMaterialsDone / (total * 5)) * 100) : 0;

    return { total, avgXP, completionRate, needyCount, comicReads: totalComicReads };
  }, [students]);

  // Data untuk Grafik (Jumlah penyelesaian per komik)
  const comicData = useMemo(() => {
    if (!students) return [];
    const comics = {
      "Misteri Batik": "komik-1",
      "Candi Megah": "komik-2",
      "Geometri Masjid": "komik-3"
    };

    return Object.entries(comics).map(([name, id]) => ({
      name,
      reads: students.filter(s => s.completedComics?.includes(id)).length
    }));
  }, [students]);

  const chartConfig = {
    reads: {
      label: "Siswa Membaca",
      color: "hsl(var(--accent))",
    },
  } satisfies ChartConfig;

  const sidebarContent = (
    <>
      <nav className="flex-1 p-4 space-y-2">
        <Button variant="secondary" className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20">
          <Users className="h-4 w-4" /> Daftar Siswa
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <BarChart3 className="h-4 w-4" /> Analisis Belajar
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <BookOpen className="h-4 w-4" /> Monitor Komik
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
    </>
  );

  if (authLoading || studentsLoading || !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full min-w-0 bg-slate-50">
      {/* Sidebar Guru */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white lg:flex">
        <div className="p-6 h-16 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">EA</div>
          <span className="font-headline font-bold text-primary">Panel GURU</span>
        </div>
        {sidebarContent}
      </aside>

      {/* Content Area */}
      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-auto">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[min(18rem,85vw)] flex-col p-0">
                <SheetHeader className="border-b p-6 text-left">
                  <SheetTitle className="font-headline text-primary">Panel GURU</SheetTitle>
                </SheetHeader>
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <h1 className="truncate font-headline font-bold text-base sm:text-lg">Ringkasan Aktivitas Siswa Realtime</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="max-w-[44vw] truncate border-primary font-bold text-primary sm:max-w-none">Guru: {profile.nama}</Badge>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Siswa", value: stats.total.toString(), sub: "Aktif di kelas", icon: Users },
              { title: "Total Baca Komik", value: stats.comicReads.toString(), sub: "Semua petualangan", icon: BookOpen },
              { title: "Selesai Materi", value: `${stats.completionRate}%`, sub: "Progress total", icon: CheckCircle2 },
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
            {/* Chart Section - Comic Monitoring */}
            <Card className="lg:col-span-7 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Monitor Pembaca Komik</CardTitle>
                <CardDescription>Jumlah siswa yang telah menyelesaikan setiap petualangan komik</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] pb-6">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comicData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12, fontWeight: 500 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="reads" 
                        fill="var(--color-reads)" 
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
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[360px]">
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
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                {student.nama.charAt(0)}
                              </div>
                              <span className="max-w-[180px] truncate">{student.nama}</span>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aktivitas Komik Terbaru */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Monitoring Literasi Budaya</CardTitle>
              <CardDescription>Daftar komik petualangan yang telah diselesaikan oleh siswa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students?.slice(0, 6).map((student, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border bg-white hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm">{student.nama}</p>
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Literasi</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Komik Selesai:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {student.completedComics && student.completedComics.length > 0 ? (
                          student.completedComics.map((comicId: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                              {comicId === 'komik-1' ? 'Misteri Batik' : comicId === 'komik-2' ? 'Candi Megah' : 'Geometri Masjid'}
                            </Badge>
                          ))
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                            <Clock className="h-3 w-3" /> Belum ada komik dibaca
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
