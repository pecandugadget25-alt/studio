
'use client';

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogIn, 
  QrCode, 
  PlayCircle, 
  BookOpen, 
  Trophy, 
  Camera, 
  ArrowLeft, 
  Star,
  Clock,
  Loader2,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function ActivityLogPage() {
  const { user, profile, loading: authLoading } = useUser();
  const db = useFirestore();

  const activityQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "activities"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(50)
    );
  }, [db, user?.uid]);

  const { data: activities, loading: activitiesLoading } = useCollection(activityQuery);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return { icon: LogIn, color: "text-blue-500", bg: "bg-blue-50" };
      case 'scan_qr': return { icon: QrCode, color: "text-accent", bg: "bg-orange-50" };
      case 'video': return { icon: PlayCircle, color: "text-red-500", bg: "bg-red-50" };
      case 'comic': return { icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" };
      case 'quiz': return { icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50" };
      case 'ar': return { icon: Camera, color: "text-purple-500", bg: "bg-purple-50" };
      default: return { icon: Star, color: "text-slate-500", bg: "bg-slate-50" };
    }
  };

  if (authLoading || activitiesLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl bg-slate-50/50 pb-32">
      <header className="sticky top-16 z-40 flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-base flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Riwayat Aktivitas
        </h1>
        <div className="w-10" />
      </header>

      <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-slate-900">Jejak Belajarmu 🐾</h2>
          <p className="text-sm text-muted-foreground font-medium">Lihat semua kegiatan dan XP yang kamu kumpulkan.</p>
        </div>

        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
               <Star className="h-12 w-12 text-slate-200" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Belum ada aktivitas belajar</h3>
              <p className="text-xs text-muted-foreground px-10">Mulai petualanganmu dengan memindai QR atau membaca komik!</p>
            </div>
            <Link href="/komik">
               <Button className="rounded-2xl font-bold bg-primary px-8">Mulai Sekarang</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((act: any) => {
              const { icon: Icon, color, bg } = getActivityIcon(act.activityType);
              return (
                <Card key={act.id} className="border-none rounded-3xl bg-white p-4 shadow-sm relative overflow-hidden group">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", bg)}>
                      <Icon className={cn("h-6 w-6", color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">{act.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">{act.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                         <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                           <Clock className="h-3 w-3" />
                           {act.timestamp ? formatDistanceToNow(new Date(act.timestamp.seconds * 1000), { addSuffix: true, locale: idLocale }) : 'baru saja'}
                         </div>
                      </div>
                    </div>
                    {act.xp > 0 && (
                      <div className="flex flex-col items-end shrink-0">
                        <Badge className="bg-yellow-50 text-yellow-700 border-none font-bold text-[10px] gap-1 px-2 py-0.5 rounded-lg shadow-sm ring-1 ring-yellow-200/50">
                          <Star className="h-3 w-3 fill-current" />
                          +{act.xp}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {/* Decorative background accent */}
                  <div className={cn("absolute -right-2 -bottom-2 w-12 h-12 rounded-full opacity-5 transition-transform group-hover:scale-110", bg)} />
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
