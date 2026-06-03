
'use client';

import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  BookOpen, 
  Camera, 
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  Loader2,
  Users
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function TeacherActivityPage() {
  const router = useRouter();
  const { db } = useFirestore();
  const { profile, loading: authLoading } = useUser();
  const [filter, setFilter] = useState("today");

  // Guard: Hanya Guru/Admin
  useEffect(() => {
    if (!authLoading && profile && profile.peran === 'siswa') {
      router.push("/");
    }
  }, [profile, authLoading, router]);

  const activitiesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
  }, [db]);

  const { data: activities, loading } = useCollection(activitiesQuery);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'quiz': return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" };
      case 'comic': return { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" };
      case 'ar': return { icon: Camera, color: "text-orange-500", bg: "bg-orange-50" };
      case 'module': return { icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-50" };
      default: return { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" };
    }
  };

  if (authLoading || !profile || profile.peran === 'siswa') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
      {/* App Bar Guru */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 android-shadow max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">LOG AKTIVITAS</h1>
        </div>
      </div>

      {/* Header */}
      <section className="px-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold text-slate-900">Aktivitas Siswa</h2>
            <p className="text-sm text-muted-foreground">Laporan interaksi belajar realtime.</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-2xl">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <Tabs defaultValue="today" className="w-full" onValueChange={setFilter}>
          <TabsList className="w-full bg-white rounded-2xl p-1 h-12 shadow-sm border-none">
            <TabsTrigger value="today" className="flex-1 rounded-xl font-bold text-xs">TERBARU</TabsTrigger>
            <TabsTrigger value="all" className="flex-1 rounded-xl font-bold text-xs">SEMUA</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Timeline Section */}
      <section className="relative space-y-4 pb-10">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activities && activities.length > 0 ? (
          <>
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200" />
            {activities.map((act: any) => {
              const styles = getTypeStyles(act.type);
              const Icon = styles.icon;
              return (
                <div key={act.id} className="relative pl-14 group">
                  <div className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center z-10 border-4 border-slate-50 transition-transform active:scale-90 shadow-sm",
                    styles.bg
                  )}>
                    <Icon className={cn("h-6 w-6", styles.color)} />
                  </div>
                  <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex items-center justify-between group-active:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        <span className="text-primary">{act.userName}</span> {act.action}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-medium lowercase">
                          {act.timestamp ? formatDistanceToNow(new Date(act.timestamp.seconds * 1000), { addSuffix: true, locale: idLocale }) : 'baru saja'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium italic">Belum ada aktivitas tercatat.</p>
          </div>
        )}
      </section>
    </div>
  );
}
