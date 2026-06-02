
'use client';

import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Loader2,
  CheckCircle2,
  BookOpen,
  Camera,
  Download,
  Printer,
  ChevronRight,
  Search,
  Bell
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TeacherMobileDashboard() {
  const router = useRouter();
  const { db } = useFirestore();
  const { user, profile, loading: authLoading } = useUser();

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (profile && profile.peran === 'siswa') {
      router.push("/");
    }
  }, [user, profile, authLoading, router]);

  const stats = useMemo(() => {
    if (!students) return { total: 0, activeToday: 0, avgXP: 0, comicReads: 0, arScans: 0 };
    
    const total = students.length;
    const totalXP = students.reduce((acc, s) => acc + (s.poin || 0), 0);
    const avgXP = total > 0 ? Math.round(totalXP / total) : 0;
    const activeToday = Math.round(total * 0.7); 
    const arScans = total * 12; 
    const comicReads = students.reduce((acc, s) => acc + (s.completedComics?.length || 0), 0);

    return { total, activeToday, avgXP, arScans, comicReads };
  }, [students]);

  if (authLoading || studentsLoading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto">
      {/* App Bar Guru */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 android-shadow max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xs">EA</div>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight uppercase">Panel Guru</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-50">
            <Search className="h-5 w-5 text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 relative">
            <Bell className="h-5 w-5 text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>

      {/* Welcome Header */}
      <section className="px-1">
        <h2 className="text-2xl font-headline font-bold text-slate-900">Halo, {profile.nama.split(' ')[0]}!</h2>
        <p className="text-sm text-muted-foreground font-medium">Pantau aktivitas belajar siswa secara realtime.</p>
      </section>

      {/* Ringkasan Statistik */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-blue-50 w-fit rounded-lg text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Siswa</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
            <p className="text-[9px] text-green-600 font-bold">{stats.activeToday} Siswa Aktif</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-orange-50 w-fit rounded-lg text-accent">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Scan AR</p>
            <h3 className="text-2xl font-bold">{stats.arScans}</h3>
            <p className="text-[9px] text-accent font-bold">Meningkat 15%</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-emerald-50 w-fit rounded-lg text-emerald-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Komik Dibaca</p>
            <h3 className="text-2xl font-bold">{stats.comicReads}</h3>
            <p className="text-[9px] text-emerald-600 font-bold">Rata-rata 2/siswa</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-purple-50 w-fit rounded-lg text-purple-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg. Nilai</p>
            <h3 className="text-2xl font-bold">85</h3>
            <p className="text-[9px] text-purple-600 font-bold">Kategori: Baik</p>
          </div>
        </Card>
      </section>

      {/* Progress Pembelajaran Quick Access */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-lg text-slate-900">Progress Siswa</h3>
          <Link href="/teacher/students">
            <Button variant="link" className="text-xs font-bold text-primary p-0 h-auto">Lihat Detail</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {students?.slice(0, 3).map((student) => (
            <Card key={student.uid} className="rounded-3xl border-none p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                  {student.nama.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{student.nama}</h4>
                  <p className="text-[10px] text-muted-foreground">Kelas 4A • XP: {student.poin}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-[9px] uppercase font-bold">Aktif</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Batik</p>
                  <Progress value={student.completedModules?.includes('batik') ? 100 : 40} className="h-1" />
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Candi</p>
                  <Progress value={student.completedModules?.includes('candi') ? 100 : 20} className="h-1" />
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Games</p>
                  <Progress value={student.completedModules?.includes('games') ? 100 : 60} className="h-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Aktivitas Terbaru */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-lg text-slate-900">Log Aktivitas</h3>
          <Link href="/teacher/activity">
            <Button variant="link" className="text-xs font-bold text-primary p-0 h-auto">Lihat Semua</Button>
          </Link>
        </div>
        <Card className="rounded-3xl border-none bg-white p-2 shadow-sm">
          {[
            { user: "Arie", action: "Selesai kuis Batik", time: "2 mnt", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
            { user: "Budi", action: "Membaca Komik Candi", time: "15 mnt", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
            { user: "Citra", action: "Scan AR Borobudur", time: "1 jam", icon: Camera, color: "text-orange-500", bg: "bg-orange-50" },
          ].map((act, i) => (
            <div key={i} className={cn("flex items-center gap-4 p-4", i !== 2 && "border-b border-slate-50")}>
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", act.bg)}>
                <act.icon className={cn("h-5 w-5", act.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900"><span className="text-primary">{act.user}</span> {act.action}</p>
                <p className="text-[10px] text-slate-400">{act.time} lalu</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-200" />
            </div>
          ))}
        </Card>
      </section>

      {/* Laporan & Export */}
      <section className="space-y-4 pb-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1">Laporan & Ekspor</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm">
            <Download className="h-5 w-5 text-primary" />
            <span className="text-[10px] uppercase">Excel</span>
          </Button>
          <Button variant="outline" className="h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm">
            <Printer className="h-5 w-5 text-accent" />
            <span className="text-[10px] uppercase">PDF</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
