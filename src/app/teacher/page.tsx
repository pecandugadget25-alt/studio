
'use client';

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Loader2,
  Bell,
  Activity,
  QrCode,
  TrendingUp,
  ChevronRight,
  Star,
  Zap,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default function TeacherMobileDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();

  // Query Data Siswa
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  // Query Aktivitas Terbaru Kelas
  const recentActivitiesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(5));
  }, [db]);

  const { data: recentActivities, loading: activitiesLoading } = useCollection(recentActivitiesQuery);

  // Proteksi Rute
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile && profile.peran === 'siswa') {
        router.push("/");
      }
    }
  }, [user, profile, authLoading, router]);

  // Statistik Kalkulasi
  const stats = useMemo(() => {
    if (!students || students.length === 0) return { 
      total: 0, 
      active: 0, 
      totalXP: 0, 
      totalBadges: 0,
      topStudents: [],
      moduleCompletion: { batik: 0, candi: 0, masjid: 0, games: 0 }
    };

    const total = students.length;
    const active = students.filter(s => (s.poin || 0) > 0).length;
    const totalXP = students.reduce((acc, s) => acc + (s.poin || 0), 0);
    const totalBadges = students.reduce((acc, s) => acc + (s.badges?.length || 0), 0);
    
    const topStudents = [...students]
      .sort((a, b) => (b.poin || 0) - (a.poin || 0))
      .slice(0, 5);

    const calcPerc = (id: string) => Math.round((students.filter(s => s.completedModules?.includes(id)).length / total) * 100);

    return { 
      total, 
      active, 
      totalXP, 
      totalBadges, 
      topStudents,
      moduleCompletion: {
        batik: calcPerc('batik'),
        candi: calcPerc('candi'),
        masjid: calcPerc('masjid'),
        games: calcPerc('games')
      }
    };
  }, [students]);

  if (authLoading || studentsLoading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto no-scrollbar">
      {/* Header Panel */}
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
        <h2 className="text-2xl font-headline font-bold text-slate-900 leading-tight">Halo, {profile.nama.split(' ')[0]}! 👋</h2>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Ringkasan Performa Kelas</p>
      </section>

      {/* SECTION: RINGKASAN KELAS */}
      <section className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-3">
          <div className="p-2 bg-blue-50 w-fit rounded-2xl text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Siswa</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-3">
          <div className="p-2 bg-orange-50 w-fit rounded-2xl text-accent">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Siswa Aktif</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-3">
          <div className="p-2 bg-yellow-50 w-fit rounded-2xl text-yellow-600">
            <Star className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total XP</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalXP.toLocaleString()}</h3>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex flex-col gap-3">
          <div className="p-2 bg-emerald-50 w-fit rounded-2xl text-emerald-600">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Lencana</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalBadges}</h3>
          </div>
        </Card>
      </section>

      {/* SECTION: TOP SISWA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" /> Top 5 Siswa
          </h3>
          <Link href="/teacher/students" className="text-[10px] font-bold text-primary uppercase">Lihat Semua</Link>
        </div>
        <Card className="rounded-3xl border-none bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {stats.topStudents.map((s, i) => (
              <div key={s.uid} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{s.nama}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">Level {s.level || 1}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{s.poin || 0} XP</p>
                </div>
              </div>
            ))}
            {stats.topStudents.length === 0 && (
              <div className="p-10 text-center text-xs text-muted-foreground italic">Belum ada aktivitas siswa.</div>
            )}
          </div>
        </Card>
      </section>

      {/* SECTION: PROGRESS MODUL KELAS */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider px-1 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Progress Modul Kelas
        </h3>
        <Card className="rounded-[2rem] border-none p-6 bg-white shadow-sm space-y-6">
          {[
            { id: 'batik', name: 'Batik Nusantara', val: stats.moduleCompletion.batik, color: 'bg-orange-500' },
            { id: 'candi', name: 'Candi Nusantara', val: stats.moduleCompletion.candi, color: 'bg-primary' },
            { id: 'masjid', name: 'Masjid Al Akbar', val: stats.moduleCompletion.masjid, color: 'bg-emerald-500' },
            { id: 'games', name: 'Permainan Tradisional', val: stats.moduleCompletion.games, color: 'bg-red-500' },
          ].map((mod) => (
            <div key={mod.id} className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">{mod.name}</span>
                <span className="text-primary">{mod.val}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${mod.color} transition-all duration-1000`} 
                  style={{ width: `${mod.val}%` }}
                />
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* SECTION: AKTIVITAS TERBARU */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider px-1 flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" /> Aktivitas Terbaru
        </h3>
        <Card className="rounded-[2rem] border-none bg-white shadow-sm overflow-hidden p-2">
          <div className="space-y-1">
            {recentActivities?.map((act: any) => (
              <div key={act.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  act.activityType === 'quiz' ? 'bg-green-50 text-green-600' : 
                  act.activityType === 'scan_qr' ? 'bg-orange-50 text-accent' : 
                  'bg-blue-50 text-primary'
                }`}>
                  {act.activityType === 'quiz' ? <Trophy className="h-4 w-4" /> : 
                   act.activityType === 'scan_qr' ? <QrCode className="h-4 w-4" /> : 
                   <Activity className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 leading-snug">
                    <span className="font-bold text-primary">{act.studentName || 'Siswa'}</span> {act.description || act.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="h-3 w-3" />
                    {act.timestamp ? formatDistanceToNow(new Date(act.timestamp.seconds * 1000), { addSuffix: true, locale: idLocale }) : 'Baru saja'}
                  </div>
                </div>
              </div>
            ))}
            {(!recentActivities || recentActivities.length === 0) && (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-slate-200" />
                <p className="text-xs text-slate-400 font-medium">Belum ada notifikasi aktivitas.</p>
              </div>
            )}
          </div>
          <Link href="/teacher/activity" className="block p-4 text-center border-t border-slate-50">
            <Button variant="ghost" className="w-full text-xs font-bold text-primary gap-2">
              Lihat Log Lengkap <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Tombol Akses Cepat */}
      <section className="space-y-3 pb-10">
        <Link href="/teacher/students">
          <Button variant="outline" className="w-full h-16 rounded-3xl border-slate-200 bg-white justify-between px-6 font-bold shadow-sm active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm">Kelola & Analisis Siswa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
