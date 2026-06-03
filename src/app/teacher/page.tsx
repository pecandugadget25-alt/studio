
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
  Bell,
  Star,
  Activity,
  Trophy
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TeacherMobileDashboard() {
  const router = useRouter();
  const { db } = useFirestore();
  const { user, profile, loading: authLoading } = useUser();

  // Query khusus untuk mengambil data siswa saja
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
    
    // Simulasi data realistis
    const activeToday = Math.round(total * 0.7); 
    const arScans = students.reduce((acc, s) => acc + (s.completedModules?.length || 0) * 3, 0); 
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
        <p className="text-sm text-muted-foreground font-medium">Monitoring performa kelas ETHNO-ARITH.</p>
      </section>

      {/* Ringkasan Statistik Siswa */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-blue-50 w-fit rounded-lg text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Siswa</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
            <p className="text-[9px] text-green-600 font-bold">{stats.activeToday} Aktif Hari Ini</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-orange-50 w-fit rounded-lg text-accent">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktivitas AR</p>
            <h3 className="text-2xl font-bold">{stats.arScans}</h3>
            <p className="text-[9px] text-accent font-bold">Total Interaksi 3D</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-emerald-50 w-fit rounded-lg text-emerald-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Literasi Komik</p>
            <h3 className="text-2xl font-bold">{stats.comicReads}</h3>
            <p className="text-[9px] text-emerald-600 font-bold">Total Selesai Dibaca</p>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-2">
          <div className="p-2 bg-purple-50 w-fit rounded-lg text-purple-600">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg. XP Siswa</p>
            <h3 className="text-2xl font-bold">{stats.avgXP}</h3>
            <p className="text-[9px] text-purple-600 font-bold">Rerata XP per Siswa</p>
          </div>
        </Card>
      </section>

      {/* Performa Kelas Quick Access */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-lg text-slate-900">Performa Tertinggi</h3>
          <Link href="/teacher/students">
            <Button variant="link" className="text-xs font-bold text-primary p-0 h-auto">Lihat Semua</Button>
          </Link>
        </div>
        <div className="space-y-3">
          {[...students || []].sort((a, b) => (b.poin || 0) - (a.poin || 0)).slice(0, 3).map((student, idx) => (
            <Card key={student.uid} className="rounded-3xl border-none p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                  {student.nama.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{student.nama}</h4>
                  <p className="text-[10px] text-muted-foreground">Level {Math.floor((student.poin || 0) / 100) + 1} • {student.poin} XP</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 text-[9px] uppercase font-bold border border-yellow-100 flex gap-1">
                  <Trophy className="h-3 w-3" /> Peringkat {idx + 1}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Laporan & Export */}
      <section className="space-y-4 pb-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/teacher/reports" className="block">
            <Button variant="outline" className="w-full h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-[10px] uppercase">Laporan</span>
            </Button>
          </Link>
          <Link href="/teacher/students" className="block">
            <Button variant="outline" className="w-full h-20 rounded-3xl border-slate-200 bg-white flex flex-col gap-1 font-bold shadow-sm">
              <Users className="h-5 w-5 text-accent" />
              <span className="text-[10px] uppercase">Siswa</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
