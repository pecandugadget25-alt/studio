'use client';

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Sparkles,
  CheckCircle2,
  Clock,
  Camera,
  BookOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { analyzeClassPerformance, type ClassAnalysisOutput } from "@/ai/flows/class-performance-analysis";
import { cn } from "@/lib/utils";
import { COMIC_LIBRARY } from "@/lib/comic-library";

export const dynamic = "force-dynamic";

export default function TeacherMobileDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const { user, profile, loading: authLoading } = useUser();

  const [aiInsight, setAiInsight] = useState<ClassAnalysisOutput | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Query Data Siswa
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  // Query Aktivitas Terbaru Kelas (Hanya aktivitas belajar)
  const recentActivitiesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "activities"), 
      where("activityType", "!=", "login"),
      orderBy("timestamp", "desc"), 
      limit(8)
    );
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
    if (!students || students.length === 0) return null;

    const total = students.length;
    const active = students.filter(s => (s.poin || 0) > 0).length;
    const totalXP = students.reduce((acc, s) => acc + (s.poin || 0), 0);
    const totalBadges = students.reduce((acc, s) => acc + (s.badges?.length || 0), 0);
    const avgXP = Math.round(totalXP / total);
    
    const topStudents = [...students]
      .sort((a, b) => (b.poin || 0) - (a.poin || 0))
      .slice(0, 5);

    const materialStats = Object.fromEntries(
      COMIC_LIBRARY.map((comic) => [
        comic.title,
        students.filter((s) => s.completedComics?.includes(comic.id)).length,
      ])
    );

    return { total, active, totalXP, totalBadges, avgXP, topStudents, materialStats };
  }, [students]);

  const safeStats = stats ?? {
    total: 0,
    active: 0,
    totalXP: 0,
    totalBadges: 0,
    avgXP: 0,
    topStudents: [],
    materialStats: Object.fromEntries(COMIC_LIBRARY.map((comic) => [comic.title, 0])),
  };

  // Invoke AI Analysis
  useEffect(() => {
    if (!stats || aiInsight || aiLoading) {
      return;
    }

    async function getInsight() {
      setAiLoading(true);
      try {
        const result = await analyzeClassPerformance({
          totalStudents: safeStats.total,
          activeStudents: safeStats.active,
          totalXP: safeStats.totalXP,
          totalBadges: safeStats.totalBadges,
          averageXP: safeStats.avgXP,
          materialStats: safeStats.materialStats,
          unfinishedCount: safeStats.total - safeStats.active
        });
        setAiInsight(result);
      } catch (e) {
        console.error(e);
      } finally {
        setAiLoading(false);
      }
    }

    void getInsight();
  }, [aiInsight, aiLoading, safeStats.active, safeStats.avgXP, safeStats.materialStats, safeStats.total, safeStats.totalBadges, safeStats.totalXP, stats]);

  if (authLoading || studentsLoading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl space-y-6 bg-slate-50/50 px-4 pb-32 pt-20 sm:px-6 lg:px-8">
      {/* Header Panel */}
      <div className="sticky top-16 z-40 -mx-4 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm">EA</div>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">DASHBOARD</h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 relative">
          <Bell className="h-5 w-5 text-slate-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
      </div>

      {/* SECTION: AI INSIGHT */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-headline font-bold text-sm uppercase tracking-wider">Insight AI Kelas</h3>
        </div>
        <Card className="rounded-[2rem] border-none bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            {aiLoading ? (
              <div className="py-4 flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Menganalisis Pola Belajar...</p>
              </div>
            ) : (
              <>
                <p className="text-xs leading-relaxed font-medium text-slate-200 italic">
                  "{aiInsight?.mainInsight}"
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">Kekuatan</p>
                    <p className="text-[10px] font-bold">{aiInsight?.strengths[0] || "Belum teridentifikasi"}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-bold text-accent uppercase tracking-widest mb-1">Perhatian</p>
                    <p className="text-[10px] font-bold">{aiInsight?.areasOfConcern[0] || "Semua berjalan baik"}</p>
                  </div>
                </div>
                <div className="pt-2">
                   <Link href="/teacher/reports">
                     <Button className="w-full bg-primary hover:bg-primary/90 font-bold rounded-xl h-10 gap-2">
                       Lihat Strategi Lengkap <ArrowRight className="h-4 w-4" />
                     </Button>
                   </Link>
                </div>
              </>
            )}
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        </Card>
      </section>

      {/* SECTION: RINGKASAN KELAS */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm space-y-3">
          <div className="p-2 bg-blue-50 w-fit rounded-2xl text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Siswa</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.total || 0}</h3>
          </div>
        </Card>
        <Card className="rounded-3xl border-none p-4 bg-white shadow-sm space-y-3">
          <div className="p-2 bg-orange-50 w-fit rounded-2xl text-accent">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aktif Belajar</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats?.active || 0}</h3>
          </div>
        </Card>
      </section>

      {/* SECTION: AKTIVITAS TERBARU (PEMBELAJARAN) */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm uppercase tracking-wider px-1 flex items-center gap-2 text-slate-900">
          <Activity className="h-4 w-4 text-accent" /> Aktivitas Pembelajaran
        </h3>
        <Card className="rounded-[2.5rem] border-none bg-white shadow-sm overflow-hidden p-2">
          <div className="divide-y divide-slate-50">
            {recentActivities?.map((act: any) => (
              <div key={act.id} className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                <div className={cn(
                  "mt-1 w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  act.activityType === 'quiz' ? 'bg-green-50 text-green-600' : 
                  act.activityType === 'scan_qr' ? 'bg-orange-50 text-accent' : 
                  act.activityType === 'comic' ? 'bg-blue-50 text-blue-600' :
                  act.activityType === 'ar' ? 'bg-purple-50 text-purple-600' :
                  'bg-slate-50 text-slate-400'
                )}>
                  {act.activityType === 'quiz' ? <Trophy className="h-5 w-5" /> : 
                   act.activityType === 'scan_qr' ? <QrCode className="h-5 w-5" /> : 
                   act.activityType === 'comic' ? <BookOpen className="h-5 w-5" /> :
                   act.activityType === 'ar' ? <Camera className="h-5 w-5" /> :
                   <Star className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 leading-snug">
                    <span className="font-bold text-slate-900">{act.studentName || 'Seorang siswa'}</span> {act.description || act.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3 w-3 text-slate-300" />
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      {act.timestamp ? formatDistanceToNow(new Date(act.timestamp.seconds * 1000), { addSuffix: true, locale: idLocale }) : 'Baru saja'}
                    </span>
                  </div>
                </div>
                {act.xp > 0 && (
                   <Badge className="bg-yellow-50 text-yellow-700 border-none font-bold text-[8px] h-fit">+{act.xp} XP</Badge>
                )}
              </div>
            ))}
            {(!recentActivities || recentActivities.length === 0) && (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                   <Activity className="h-6 w-6 text-slate-200" />
                </div>
                <p className="text-xs text-slate-400 font-medium italic">Belum ada aktivitas belajar hari ini.</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* SECTION: TOP SISWA */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" /> Siswa Teraktif
          </h3>
          <Link href="/teacher/students" className="text-[10px] font-bold text-primary uppercase">Lihat Semua</Link>
        </div>
        <Card className="rounded-3xl border-none bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {stats?.topStudents.map((s, i) => (
              <div key={s.uid} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-300">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate text-slate-900">{s.nama}</h4>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Level {s.level || 1} • {s.badges?.length || 0} Lencana</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{s.poin || 0} XP</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Tombol Akses Cepat */}
      <section className="pb-10">
        <Link href="/teacher/students">
          <Button variant="outline" className="w-full h-16 rounded-[1.5rem] border-slate-200 bg-white justify-between px-6 font-bold shadow-sm active:scale-95 transition-all">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm text-slate-700">Data & Analisis Siswa</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
