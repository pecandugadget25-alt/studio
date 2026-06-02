
'use client';

import { useState } from "react";
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
  MapPin
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MOCK_ACTIVITIES = [
  { id: 1, user: "Arie Santoso", action: "Menyelesaikan Kuis Batik", time: "2 menit lalu", type: "quiz", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
  { id: 2, user: "Budi Wijaya", action: "Membaca Komik Candi Megah", time: "15 menit lalu", type: "comic", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 3, user: "Citra Lestari", action: "Scan AR Candi Borobudur", time: "1 jam lalu", type: "ar", icon: Camera, color: "text-orange-500", bg: "bg-orange-50" },
  { id: 4, user: "Dedi Kusuma", action: "Membuka Modul Masjid Al Akbar", time: "2 jam lalu", type: "module", icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 5, user: "Eka Putri", action: "Mendapatkan Lencana Ahli Batik", time: "3 jam lalu", type: "achievement", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  { id: 6, user: "Fajar Ramadhan", action: "Membaca Komik Batik Nusantara", time: "5 jam lalu", type: "comic", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
];

export default function TeacherActivityPage() {
  const [filter, setFilter] = useState("today");

  return (
    <div className="pt-20 pb-28 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto">
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
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 relative">
            <Bell className="h-5 w-5 text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>

      {/* Header */}
      <section className="px-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold text-slate-900">Aktivitas Siswa</h2>
            <p className="text-sm text-muted-foreground">Laporan interaksi belajar hari ini.</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-2xl">
            <Activity className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <Tabs defaultValue="today" className="w-full" onValueChange={setFilter}>
          <TabsList className="w-full bg-white rounded-2xl p-1 h-12 shadow-sm border-none">
            <TabsTrigger value="today" className="flex-1 rounded-xl font-bold text-xs">HARI INI</TabsTrigger>
            <TabsTrigger value="week" className="flex-1 rounded-xl font-bold text-xs">MINGGU INI</TabsTrigger>
            <TabsTrigger value="month" className="flex-1 rounded-xl font-bold text-xs">BULAN INI</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Timeline Section */}
      <section className="relative space-y-4">
        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200" />
        
        {MOCK_ACTIVITIES.map((act) => (
          <div key={act.id} className="relative pl-14 group">
            <div className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center z-10 border-4 border-slate-50 transition-transform active:scale-90 shadow-sm",
              act.bg
            )}>
              <act.icon className={cn("h-6 w-6", act.color)} />
            </div>
            <Card className="rounded-3xl border-none p-4 bg-white shadow-sm flex items-center justify-between group-active:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  <span className="text-primary">{act.user}</span> {act.action}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-medium">{act.time}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-200" />
            </Card>
          </div>
        ))}

        <div className="pt-4 flex justify-center">
          <Button variant="ghost" className="text-xs font-bold text-primary gap-2">
            Lihat Lebih Banyak <Clock className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
