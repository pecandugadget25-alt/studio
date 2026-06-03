
'use client';

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft,
  Bell,
  Star,
  Loader2,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { cn } from "@/lib/utils";

export default function TeacherStudentsPage() {
  const { db } = useFirestore();
  const { profile, loading: authLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "users"), 
      where("peran", "==", "siswa")
    );
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students
      .filter(s => s.nama?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (b.poin || 0) - (a.poin || 0));
  }, [students, searchTerm]);

  if (authLoading || studentsLoading) {
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
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">DATA SISWA</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-slate-50 relative">
            <Bell className="h-5 w-5 text-slate-400" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
        </div>
      </div>

      {/* Header & Stats */}
      <section className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-slate-900">Daftar Siswa</h2>
          <p className="text-sm text-muted-foreground">{filteredStudents.length} Siswa Terdaftar</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Users className="h-6 w-6 text-primary" />
        </div>
      </section>

      {/* Search & Filter */}
      <section className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cari nama siswa..." 
            className="pl-10 h-12 bg-white rounded-2xl border-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 w-12 rounded-2xl bg-white border-none shadow-sm p-0">
          <Filter className="h-5 w-5 text-slate-600" />
        </Button>
      </section>

      {/* Student List */}
      <section className="space-y-3">
        {filteredStudents.map((student) => (
          <Link key={student.uid} href={`/teacher/students/${student.uid}`}>
            <Card className="rounded-3xl border-none p-4 bg-white shadow-sm hover:ring-2 ring-primary/20 transition-all mb-3">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
                  <img 
                    src={`https://picsum.photos/seed/${student.uid}/100/100`} 
                    alt={student.nama}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://placehold.co/100/100?text=S')}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{student.nama}</h4>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[9px] uppercase font-bold px-2">Level {student.level || 1}</Badge>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-[10px] font-bold text-yellow-700">{student.poin || 0} XP</span>
                    </div>
                  </div>

                  {/* Progress Mini Grid */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-50">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Batik</p>
                      <Progress value={student.completedModules?.includes('batik') ? 100 : 0} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Candi</p>
                      <Progress value={student.completedModules?.includes('candi') ? 100 : 0} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Games</p>
                      <Progress value={student.completedModules?.includes('games') ? 100 : 0} className="h-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {filteredStudents.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium italic">Siswa tidak ditemukan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
