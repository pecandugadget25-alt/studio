
'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  ArrowLeft, 
  Star, 
  Medal,
  Crown,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useFirebase, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

export default function LeaderboardPage() {
  const { db } = useFirebase();

  const topStudentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "users"), 
      orderBy("poin", "desc"), 
      limit(10)
    );
  }, [db]);

  const { data: students, loading } = useCollection(topStudentsQuery);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F5]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const topThree = students?.slice(0, 3) || [];
  const rest = students?.slice(3) || [];

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-20">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Papan Peringkat Nusantara
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Top 3 Podiums */}
        <div className="grid grid-cols-3 gap-4 mb-12 items-end">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-300 overflow-hidden shadow-lg">
                   <img src={`https://picsum.photos/seed/${topThree[1].uid}/100/100`} alt="2nd" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-800 font-bold shadow">2</div>
              </div>
              <div className="text-center w-full">
                <p className="font-bold text-sm truncate">{topThree[1].nama.split(' ')[0]}</p>
                <Badge variant="secondary" className="mt-1">{topThree[1].poin} XP</Badge>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="flex flex-col items-center space-y-4 -translate-y-4">
              <div className="relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-500">
                  <Crown className="h-8 w-8" />
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl">
                   <img src={`https://picsum.photos/seed/${topThree[0].uid}/100/100`} alt="1st" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold shadow-lg">1</div>
              </div>
              <div className="text-center w-full">
                <p className="font-bold text-lg truncate">{topThree[0].nama.split(' ')[0]}</p>
                <Badge className="bg-yellow-500 mt-1">{topThree[0].poin} XP</Badge>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-amber-600 overflow-hidden shadow-lg">
                   <img src={`https://picsum.photos/seed/${topThree[2].uid}/100/100`} alt="3rd" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-amber-100 font-bold shadow">3</div>
              </div>
              <div className="text-center w-full">
                <p className="font-bold text-sm truncate">{topThree[2].nama.split(' ')[0]}</p>
                <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-800">{topThree[2].poin} XP</Badge>
              </div>
            </div>
          )}
        </div>

        <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle>Peringkat Sepuluh Besar</CardTitle>
            <CardDescription>Ayo terus belajar dan jadilah yang terbaik di seluruh Nusantara!</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-20 text-center">Posisi</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead className="text-center">Level</TableHead>
                  <TableHead className="text-right pr-8">Total XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student, i) => (
                  <TableRow key={student.uid} className={i < 3 ? 'bg-yellow-50/30 font-bold' : ''}>
                    <TableCell className="text-center">
                      {i + 1 === 1 && <Crown className="h-5 w-5 mx-auto text-yellow-500" />}
                      {i + 1 === 2 && <Medal className="h-5 w-5 mx-auto text-slate-400" />}
                      {i + 1 === 3 && <Medal className="h-5 w-5 mx-auto text-amber-600" />}
                      {i + 1 > 3 && <span className="text-muted-foreground">{i + 1}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border">
                           <img src={`https://picsum.photos/seed/${student.uid}/100/100`} alt={student.nama} />
                        </div>
                        <div>
                          <p className="font-bold">{student.nama}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{student.peran}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">Lv {Math.floor((student.poin || 0) / 100) + 1}</Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-lg text-primary">{student.poin}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
