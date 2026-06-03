'use client';

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Loader2,
  Bell,
  Activity,
  QrCode,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";

export const dynamic = "force-dynamic";

export default function TeacherMobileDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();
  const [randomStats, setRandomStats] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile && profile.peran === 'siswa') {
        router.push("/");
      }
    }
  }, [user, profile, authLoading, router]);

  useEffect(() => {
    const types = ['Video', 'Modul', 'AR', 'Kuis', 'Komik'];
    const stats: Record<string, number> = {};
    types.forEach(t => {
      stats[t] = Math.floor(Math.random() * 15) + 5;
    });
    setRandomStats(stats);
  }, []);

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  const stats = useMemo(() => {
    if (!students || students.length === 0) return { total: 0, activeToday: 0, totalScans: 0 };
    const total = students.length;
    const totalScans = students.reduce((acc, s) => acc + (Number(s.scanCount) || 0), 0);
    const activeToday = Math.max(1, Math.round(total * 0.8)); 
    return { total, activeToday, totalScans };
  }, [students]);

  if (authLoading || studentsLoading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm">EA</div>
          <h1 className="font-headline font-bold text-lg text-primary uppercase tracking-tight">Panel Guru</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-50">
            <Bell className="h-5 w-5 text-slate-400" />
          </Button>
        </div>
      </div>

      <section className="px-1">
        <h2 className="text-2xl font-headline font-bold text-slate-900">Halo, {profile.nama.split(' ')[0]}!</h2>
        <p className="text-sm text-muted-foreground font-medium">Monitoring performa kelas hari ini.</p>
      </section>

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
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktivitas QR</p>
            <h3 className="text-2xl font-bold">{stats.totalScans}</h3>
            <p className="text-[9px] text-accent font-bold">Total Interaksi</p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="font-headline font-bold text-lg text-slate-900 px-1 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Statistik Belajar
        </h3>
        <Card className="rounded-3xl border-none p-6 bg-white shadow-sm">
           <div className="grid grid-cols-3 gap-6 text-center">
              {['Video', 'Modul', 'AR', 'Kuis', 'Komik'].map((t) => (
                <div key={t} className="space-y-1">
                   <p className="text-[8px] font-bold text-muted-foreground uppercase">{t}</p>
                   <p className="text-xl font-bold">{randomStats[t] || '...'}</p>
                </div>
              ))}
              <div className="space-y-1">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">Total</p>
                 <p className="text-xl font-bold text-primary">{stats.totalScans}</p>
              </div>
           </div>
        </Card>
      </section>

      <section className="space-y-3 pb-10">
        <Link href="/teacher/students">
          <Button variant="outline" className="w-full h-16 rounded-3xl border-slate-200 bg-white justify-between px-6 font-bold shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm">Kelola & Analisis Siswa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </Link>
        <Link href="/teacher/reports">
          <Button variant="outline" className="w-full h-16 rounded-3xl border-slate-200 bg-white justify-between px-6 font-bold shadow-sm">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-accent" />
              <span className="text-sm">Unduh Laporan Performa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
