'use client';

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Star,
  Loader2,
  Database
} from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function TeacherStudentsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { profile, loading: authLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("peran", "==", "siswa"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students
      .filter(s => s.nama?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (Number(b.poin) || 0) - (Number(a.poin) || 0));
  }, [students, searchTerm]);

  if (authLoading || studentsLoading || !profile) {
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
          <h1 className="font-headline font-bold text-lg text-primary tracking-tight">DATA SISWA</h1>
        </div>
      </div>

      <section className="px-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-bold text-slate-900">Daftar Siswa</h2>
          <p className="text-sm text-muted-foreground">{filteredStudents.length} Siswa Terdaftar</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Users className="h-6 w-6 text-primary" />
        </div>
      </section>

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
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Link key={student.uid} href={`/teacher/students/${student.uid}`}>
              <Card className="rounded-3xl border-none p-4 bg-white shadow-sm hover:ring-2 ring-primary/20 transition-all">
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
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
             <Database className="h-10 w-10 text-slate-200 mx-auto" />
             <p className="text-sm font-bold text-slate-400">Belum ada siswa di database.</p>
          </div>
        )}
      </section>
    </div>
  );
}
