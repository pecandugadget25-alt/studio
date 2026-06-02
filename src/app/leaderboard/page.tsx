'use client';

import { useMemo, useState } from "react";
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
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useFirebase, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";

// Data dummy untuk testing atau jika database kosong
const DUMMY_STUDENTS = [
  { uid: 'dummy-1', nama: 'Andi Santoso', poin: 250, peran: 'siswa' },
  { uid: 'dummy-2', nama: 'Budi Wijaya', poin: 180, peran: 'siswa' },
  { uid: 'dummy-3', nama: 'Siti Aminah', poin: 150, peran: 'siswa' },
  { uid: 'dummy-4', nama: 'Dedi Kusuma', poin: 120, peran: 'siswa' },
  { uid: 'dummy-5', nama: 'Eka Putri', poin: 95, peran: 'siswa' },
];

export default function LeaderboardPage() {
  const { db } = useFirebase();

  // Query leaderboard: filter siswa, urut poin desc
  const topStudentsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, "users"), 
      where("peran", "==", "siswa"),
      orderBy("poin", "desc"), 
      limit(10)
    );
  }, [db]);

  const { data: students, loading, error } = useCollection(topStudentsQuery);

  // Logika Data Tampilan (Gunakan dummy jika error atau kosong)
  const displayData = useMemo(() => {
    if (loading) return [];
    if (!students || students.length === 0) return DUMMY_STUDENTS;
    return students;
  }, [students, loading]);

  const topThree = displayData.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-20">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-base sm:text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="hidden sm:inline">Papan Peringkat Nusantara</span>
          <span className="sm:hidden">Leaderboard</span>
        </h1>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Menghubungkan ke Nusantara...</p>
          </div>
        ) : (
          <>
            {/* Visualisasi Top 3 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-12 items-end">
              {/* Peringkat 2 */}
              {topThree[1] && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-slate-300 overflow-hidden shadow-lg bg-white">
                       <img 
                        src={`https://picsum.photos/seed/${topThree[1].uid}/100/100`} 
                        alt="2nd" 
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=2')}
                       />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-800 text-xs sm:text-sm font-bold shadow">2</div>
                  </div>
                  <div className="text-center w-full px-1">
                    <p className="font-bold text-[10px] sm:text-xs truncate">{topThree[1].nama.split(' ')[0]}</p>
                    <Badge variant="secondary" className="mt-1 text-[8px] sm:text-[10px]">{topThree[1].poin} XP</Badge>
                  </div>
                </div>
              )}

              {/* Peringkat 1 */}
              {topThree[0] && (
                <div className="flex flex-col items-center space-y-4 -translate-y-4">
                  <div className="relative">
                    <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 text-yellow-500">
                      <Crown className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl bg-white">
                       <img 
                        src={`https://picsum.photos/seed/${topThree[0].uid}/100/100`} 
                        alt="1st" 
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=1')}
                       />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-xs sm:text-sm font-bold shadow-lg">1</div>
                  </div>
                  <div className="text-center w-full px-1">
                    <p className="font-bold text-xs sm:text-lg truncate">{topThree[0].nama.split(' ')[0]}</p>
                    <Badge className="bg-yellow-500 mt-1 text-[10px] sm:text-xs text-white border-none">{topThree[0].poin} XP</Badge>
                  </div>
                </div>
              )}

              {/* Peringkat 3 */}
              {topThree[2] && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-amber-600 overflow-hidden shadow-lg bg-white">
                       <img 
                        src={`https://picsum.photos/seed/${topThree[2].uid}/100/100`} 
                        alt="3rd" 
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=3')}
                       />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-amber-600 rounded-full flex items-center justify-center text-amber-100 text-xs sm:text-sm font-bold shadow">3</div>
                  </div>
                  <div className="text-center w-full px-1">
                    <p className="font-bold text-[10px] sm:text-xs truncate">{topThree[2].nama.split(' ')[0]}</p>
                    <Badge variant="secondary" className="mt-1 bg-amber-100 text-amber-800 text-[8px] sm:text-[10px] border-none">{topThree[2].poin} XP</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Notifikasi Fallback / Empty */}
            {(error || (students && students.length === 0)) && (
              <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <p className="text-[11px] text-blue-700 font-medium">
                  {error ? "Terjadi kendala sinkronisasi. Menampilkan peringkat simulasi." : "Data peringkat sedang diperbarui. Jadilah yang pertama di papan peringkat!"}
                </p>
              </div>
            )}

            <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
              <CardHeader className="bg-white border-b px-6 py-4">
                <CardTitle className="text-base sm:text-xl">Peringkat Sepuluh Besar Siswa</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Jadilah yang terbaik di seluruh Nusantara!</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="w-16 sm:w-20 text-center text-xs">Pos</TableHead>
                      <TableHead className="text-xs">Siswa</TableHead>
                      <TableHead className="text-center text-xs">Level</TableHead>
                      <TableHead className="text-right pr-4 sm:pr-8 text-xs">Total XP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayData.map((student, i) => (
                      <TableRow key={student.uid} className={i < 3 ? 'bg-yellow-50/20 font-bold' : ''}>
                        <TableCell className="text-center">
                          {i === 0 && <Crown className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-yellow-500" />}
                          {i === 1 && <Medal className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-slate-400" />}
                          {i === 2 && <Medal className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-amber-600" />}
                          {i > 2 && <span className="text-muted-foreground text-xs">{i + 1}</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border shrink-0 bg-slate-50">
                               <img 
                                src={`https://picsum.photos/seed/${student.uid}/100/100`} 
                                alt={student.nama} 
                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=Avatar')}
                               />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs sm:text-sm truncate">{student.nama}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">Lv {Math.floor((student.poin || 0) / 100) + 1}</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-4 sm:pr-8">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                            <span className="text-sm sm:text-lg text-primary">{student.poin}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}