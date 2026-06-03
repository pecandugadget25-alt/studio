
'use client';

import { use, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Star, 
  Trophy, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Mail,
  Calendar,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  
  const studentRef = useMemo(() => {
    if (!db || !id) return null;
    return doc(db, "users", id);
  }, [db, id]);

  const { data: student, loading } = useDoc(studentRef);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-muted-foreground">Siswa tidak ditemukan.</p>
        <Link href="/teacher/students">
          <Button>Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const MODULES = [
    { id: 'batik', name: 'Batik Nusantara' },
    { id: 'candi', name: 'Candi Nusantara' },
    { id: 'masjid', name: 'Masjid Al Akbar' },
    { id: 'games', name: 'Permainan Tradisional' },
  ];

  return (
    <div className="pt-20 pb-32 px-4 space-y-6 bg-slate-50/50 min-h-screen max-w-[500px] mx-auto overflow-y-auto">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 android-shadow max-w-[500px] mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/teacher/students">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">DETAIL SISWA</h1>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="rounded-[2.5rem] border-none p-6 bg-white shadow-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-100">
             <img 
              src={`https://picsum.photos/seed/${student.uid}/200/200`} 
              alt={student.nama} 
              className="w-full h-full object-cover"
             />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold">{student.nama}</h2>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Mail className="h-3 w-3" /> {student.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-primary px-4 py-1 rounded-full uppercase text-[10px] font-bold">Level {student.level || 1}</Badge>
            <Badge variant="outline" className="px-4 py-1 rounded-full uppercase text-[10px] font-bold border-primary text-primary">Siswa</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-3xl border border-yellow-100 text-center space-y-1">
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Total Poin</p>
            <div className="flex items-center justify-center gap-1.5">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-xl font-bold text-yellow-700">{student.poin || 0}</span>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 text-center space-y-1">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Lencana</p>
            <div className="flex items-center justify-center gap-1.5">
              <Trophy className="h-5 w-5 text-blue-500" />
              <span className="text-xl font-bold text-blue-700">{student.badges?.length || 0}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Modul */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm px-1 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Progres Pembelajaran
        </h3>
        <div className="space-y-3">
          {MODULES.map((mod) => {
            const isCompleted = student.completedModules?.includes(mod.id);
            return (
              <Card key={mod.id} className="rounded-2xl border-none p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">{mod.name}</span>
                  {isCompleted ? (
                    <Badge className="bg-green-500 text-white text-[9px] uppercase font-bold">Selesai</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold">Belum Selesai</Badge>
                  )}
                </div>
                <Progress value={isCompleted ? 100 : 0} className="h-2" />
              </Card>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-sm px-1 flex items-center gap-2">
          <Award className="h-4 w-4 text-accent" /> Lencana Dicapai
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {student.badges && student.badges.length > 0 ? (
            student.badges.map((badge: string, idx: number) => (
              <Card key={idx} className="rounded-2xl border-none p-3 bg-white shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <span className="text-[10px] font-bold leading-tight uppercase">{badge}</span>
              </Card>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic col-span-2 px-1">Belum ada lencana yang didapatkan.</p>
          )}
        </div>
      </section>
    </div>
  );
}
