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
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useFirebase, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";

// Data dummy nusantara jika Firestore kosong atau error
const DUMMY_STUDENTS = [
  { uid: 'dummy-1', nama: 'Andi Santoso', poin: 250, peran: 'siswa' },
  { uid: 'dummy-2', nama: 'Budi Wijaya', poin: 180, peran: 'siswa' },
  { uid: 'dummy-3', nama: 'Siti Aminah', poin: 150, peran: 'siswa' },
  { uid: 'dummy-4', nama: 'Dedi Kusuma', poin: 120, peran: 'siswa' },
  { uid: 'dummy-5', nama: 'Eka Putri', poin: 95, peran: 'siswa' },
  { uid: 'dummy-6', nama: 'Fajar Ramadhan', poin: 80, peran: 'siswa' },
  { uid: 'dummy-7', nama: 'Gita Permata', poin: 65, peran: 'siswa' },
  { uid: 'dummy-8', nama: 'Hendra Wijaya', poin: 50, peran: 'siswa' },
  { uid: 'dummy-9', nama: 'Indah Sari', poin: 45, peran: 'siswa' },
  { uid: 'dummy-10', nama: 'Joko Susilo', poin: 30, peran: 'siswa' },
];

export default function LeaderboardPage() {
  const { db } = useFirebase();

  // Query leaderboard: Hanya mengambil role siswa dari collection 'users'
  const topStudentsQuery = useMemo(() => {
    if (!db) return null;
    try {
      return query(
        collection(db, "users"), 
        where("peran", "==", "siswa"),
        orderBy("poin", "desc"), 
        limit(10)
      );
    } catch (e) {
      console.error("Gagal membuat query leaderboard:", e);
      return null;
    }
  }, [db]);

  const { data: students, loading, error } = useCollection(topStudentsQuery);

  // Gunakan data simulasi jika loading gagal atau data kosong
  const displayData = useMemo(() => {
    if (loading) return [];
    if (error || !students || students.length === 0) return DUMMY_STUDENTS;
    return students;
  }, [students, loading, error]);

  const topThree = displayData.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-24">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm max-w-[500px] mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-base flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Peringkat Nusantara
        </h1>
        <div className="w-10" />
      </header>

      <main className="px-4 py-8 space-y-8 max-w-[500px] mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">Memuat Papan Peringkat...</p>
          </div>
        ) : (
          <>
            {/* Podium Visual Top 3 */}
            <div className="grid grid-cols-3 gap-2 items-end pt-8 pb-4">
              {/* Peringkat 2 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-200 overflow-hidden bg-white shadow-md">
                    <img 
                      src={`https://picsum.photos/seed/${topThree[1]?.uid || '2'}/100/100`} 
                      alt="2nd" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold">2</div>
                </div>
                <div className="text-center w-full px-1">
                  <p className="font-bold text-[10px] truncate">{topThree[1]?.nama || 'Siswa 2'}</p>
                  <Badge variant="secondary" className="mt-1 text-[8px] bg-slate-100">{topThree[1]?.poin || 0} XP</Badge>
                </div>
              </div>

              {/* Peringkat 1 */}
              <div className="flex flex-col items-center space-y-2 -translate-y-4">
                <div className="relative">
                  <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500 drop-shadow-md" />
                  <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden bg-white shadow-xl">
                    <img 
                      src={`https://picsum.photos/seed/${topThree[0]?.uid || '1'}/100/100`} 
                      alt="1st" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-xs font-bold border-2 border-white shadow">1</div>
                </div>
                <div className="text-center w-full px-1">
                  <p className="font-bold text-xs truncate">{topThree[0]?.nama || 'Siswa 1'}</p>
                  <Badge className="bg-yellow-500 mt-1 text-[10px] text-white border-none">{topThree[0]?.poin || 0} XP</Badge>
                </div>
              </div>

              {/* Peringkat 3 */}
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 overflow-hidden bg-white shadow-md">
                    <img 
                      src={`https://picsum.photos/seed/${topThree[2]?.uid || '3'}/100/100`} 
                      alt="3rd" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">3</div>
                </div>
                <div className="text-center w-full px-1">
                  <p className="font-bold text-[10px] truncate">{topThree[2]?.nama || 'Siswa 3'}</p>
                  <Badge variant="secondary" className="mt-1 text-[8px] bg-amber-50 text-amber-700">{topThree[2]?.poin || 0} XP</Badge>
                </div>
              </div>
            </div>

            {/* List Peringkat 10 Besar */}
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b px-6 py-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Peringkat 10 Besar</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-12 text-center text-[10px] font-bold">POS</TableHead>
                      <TableHead className="text-[10px] font-bold">SISWA</TableHead>
                      <TableHead className="text-right pr-6 text-[10px] font-bold">SKOR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayData.map((student, i) => (
                      <TableRow key={student.uid} className={`border-slate-50 transition-colors ${i < 3 ? 'bg-yellow-50/10' : ''}`}>
                        <TableCell className="text-center">
                          {i < 3 ? (
                            <Medal className={`h-5 w-5 mx-auto ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : 'text-amber-600'}`} />
                          ) : (
                            <span className="text-xs font-bold text-slate-300">{i + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-slate-50 shrink-0">
                               <img 
                                src={`https://picsum.photos/seed/${student.uid}/100/100`} 
                                alt={student.nama} 
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100?text=S')}
                               />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate text-slate-800">{student.nama}</p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase">LV. {Math.floor((student.poin || 0) / 100) + 1}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-bold text-primary font-mono">{student.poin}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Info Message (Hanya muncul jika data simulasi ditampilkan) */}
            {(error || students?.length === 0) && (
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-600 font-medium leading-relaxed">
                  Data peringkat sedang disinkronkan secara realtime. Teruslah belajar untuk meningkatkan posisimu di Nusantara!
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
