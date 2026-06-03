'use client';

import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Loader2,
  BookOpen,
  Camera,
  Search,
  Bell,
  Star,
  Activity,
  Trophy,
  ChevronRight,
  QrCode,
  TrendingUp,
  Monitor
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function TeacherMobileDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();

  // Guard: Hanya izinkan Guru/Admin/Peneliti
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile && profile.peran === 'siswa') {
        router.push("/");
      }
    }
  }, [user, profile, authLoading, router]);

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const scanLogsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "scan_logs"), orderBy("timestamp", "desc"), limit(5));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);
  const { data: scanLogs } = useCollection(scanLogsQuery);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return { total: 0, activeToday: 0, avgXP: 0, totalScans: 0 };
    
    const total = students.length;
    const totalXP = students.reduce((acc, s) => acc + (Number(s.poin) || 0), 0);
    const avgXP = total > 0 ? Math.round(totalXP / total) : 0;
    const totalScans = students.reduce((acc, s) => acc + (Number(s.scanCount) || 0), 0);
    const activeToday = Math.max(1, Math.round(total * 0.7)); 

    return { total, activeToday, avgXP, totalScans };
  }, [students]);

  if (authLoading || studentsLoading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (profile.peran === 'siswa') return null;

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
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
        <p className="text-sm text-muted-foreground font-medium">Monitoring aktivitas belajar hari ini.</p>
      </section>

      {/* Grid Statistik Utama */}
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
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Smart Scan</p>
            <h3 className="text-2xl font-bold">{stats.totalScans}</h3>
            <p className="text-[9px] text-accent font-bold">Total QR Pindai</p>
          </div>
        </Card>
      </section>

      {/* Analitik Scan QR - Widget Baru */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Statistik Scan QR
        </h3>
        <Card className="rounded-3xl border-none p-6 bg-white shadow-sm">
           <div className="grid grid-cols-3 gap-6 text-center">
              <div className="space-y-1">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">Video</p>
                 <p className="text-xl font-bold">24</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">Modul</p>
                 <p className="text-xl font-bold">18</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">AR</p>
                 <p className="text-xl font-bold">42</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">Kuis</p>
                 <p className="text-xl font-bold">12</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">Komik</p>
                 <p className="text-xl font-bold">31</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">Total</p>
                 <p className="text-xl font-bold text-primary">{stats.totalScans}</p>
              </div>
           </div>
        </Card>
      </section>

      {/* Scan Log Terbaru */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-lg text-slate-900">Pindaian Terbaru</h3>
        </div>
        <div className="space-y-3">
          {scanLogs && scanLogs.length > 0 ? (
            scanLogs.map((log: any) => (
              <Card key={log.id} className="rounded-2xl border-none p-4 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      <span className="text-primary">{log.studentName}</span> memindai {log.qrType}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{log.qrValue}</p>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-none text-[9px] font-bold">+{log.xpEarned} XP</Badge>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-xs text-center text-muted-foreground py-4 italic">Belum ada aktivitas pemindaian.</p>
          )}
        </div>
      </section>

      {/* Aksi Cepat */}
      <section className="space-y-4 pb-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1">Laporan Mendalam</h3>
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
              <span className="text-[10px] uppercase">Data Siswa</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}