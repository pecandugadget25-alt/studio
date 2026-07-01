'use client';

import { useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  ArrowLeft, 
  BookOpen, 
  Camera, 
  Clock,
  TrendingUp,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function TeacherActivityPage() {
  const router = useRouter();
  const db = useFirestore();
  const { profile, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && profile && profile.peran === 'siswa') {
      router.push("/");
    }
  }, [profile, authLoading, router]);

  const activitiesQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(20));
  }, [db]);

  const { data: activities, loading } = useCollection(activitiesQuery);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'quiz': return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" };
      case 'comic': return { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" };
      case 'ar': return { icon: Camera, color: "text-orange-500", bg: "bg-orange-50" };
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
    <div className="mx-auto min-h-screen w-full max-w-screen-xl space-y-6 bg-slate-50/50 px-4 pb-28 pt-20 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-40 -mx-4 flex h-16 items-center justify-between border-b border-slate-100 bg-white px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/teacher">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">LOG AKTIVITAS</h1>
        </div>
      </div>

      <section className="relative space-y-4 pb-10">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activities?.map((act: any) => {
          const styles = getTypeStyles(act.type);
          const Icon = styles.icon;
          return (
            <div key={act.id} className="relative pl-14">
              <div className="absolute left-[27px] top-6 bottom-[-20px] w-0.5 bg-slate-200 last:hidden" />
              <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center z-10 border-4 border-slate-50 shadow-sm", styles.bg)}>
                <Icon className={cn("h-6 w-6", styles.color)} />
              </div>
              <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex items-center justify-between">
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
      </section>
    </div>
  );
}
