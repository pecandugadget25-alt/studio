
'use client';

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users
} from "lucide-react";
import Link from "next/link";
import { useFirebase, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

export default function LeaderboardPage() {
  const { db } = useFirebase();

  // Query dasar ke users (tanpa orderBy/where komposit untuk menghindari error index)
  const usersQuery = useMemo(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: allUsers, loading, error } = useCollection(usersQuery);

  // Proses data di sisi klien: Filter siswa, urutkan poin, limit 10
  const displayData = useMemo(() => {
    if (loading || error || !allUsers) return [];
    
    return allUsers
      .filter(u => u.peran === 'siswa' && (u.poin || 0) >= 0) // Tampilkan semua siswa, utamakan yang punya XP
      .sort((a, b) => (b.poin || 0) - (a.poin || 0))
      .slice(0, 10);
  }, [allUsers, loading, error]);

  const topThree = displayData.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F5] pb-32 overflow-y-auto">
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
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-10 w-10 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">Belum ada data peringkat siswa</h3>
              <p className="text-xs text-slate-500 px-10 leading-relaxed">Jadilah yang pertama untuk meraih peringkat tertinggi dengan belajar dan mengerjakan kuis!</p>
            </div>
            <Link href="/modules">
              <Button className="rounded-2xl font-bold bg-primary px-8 h-12 shadow-lg">Mulai Belajar</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Podium Visual */}
            <div className="grid grid-cols-3 gap-2 items-end pt-8 pb-4 min-h-[220px]">
              {/* Rank 2 */}
              <div className="flex flex-col items-center space-y-2">
                {topThree[1] ? (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-50 shadow-md">
                        <img 
                          src={`https://picsum.photos/seed/${topThree[1].uid}/100/100`} 
                          alt={topThree[1].nama || "Siswa"} 
                          className="object-cover w-full h-full"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100/100?text=S' }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">2</div>
                    </div>
                    <div className="text-center w-full px-1">
                      <p className="font-bold text-[10px] truncate">{topThree[1].nama || "Siswa"}</p>
                      <Badge variant="secondary" className="mt-1 text-[8px] bg-slate-100">{(topThree[1].poin || 0)} XP</Badge>
                    </div>
                  </>
                ) : (
                   <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center">
                     <span className="text-slate-300 text-xs">#2</span>
                   </div>
                )}
              </div>

              {/* Rank 1 */}
              <div className="flex flex-col items-center space-y-2 -translate-y-4">
                {topThree[0] ? (
                  <>
                    <div className="relative">
                      <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500 drop-shadow-md" />
                      <div className="w-20 h-20 rounded-full border-4 border-yellow-400 overflow-hidden bg-slate-50 shadow-xl">
                        <img 
                          src={`https://picsum.photos/seed/${topThree[0].uid}/100/100`} 
                          alt={topThree[0].nama || "Juara"} 
                          className="object-cover w-full h-full"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100/100?text=S' }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 text-xs font-bold border-2 border-white shadow">1</div>
                    </div>
                    <div className="text-center w-full px-1">
                      <p className="font-bold text-xs truncate">{topThree[0].nama || "Juara"}</p>
                      <Badge className="bg-yellow-500 mt-1 text-[10px] text-white border-none shadow-sm">{(topThree[0].poin || 0)} XP</Badge>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Rank 3 */}
              <div className="flex flex-col items-center space-y-2">
                {topThree[2] ? (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 overflow-hidden bg-slate-50 shadow-md">
                        <img 
                          src={`https://picsum.photos/seed/${topThree[2].uid}/100/100`} 
                          alt={topThree[2].nama || "Siswa"} 
                          className="object-cover w-full h-full"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100/100?text=S' }}
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">3</div>
                    </div>
                    <div className="text-center w-full px-1">
                      <p className="font-bold text-[10px] truncate">{topThree[2].nama || "Siswa"}</p>
                      <Badge variant="secondary" className="mt-1 text-[8px] bg-amber-50 text-amber-700">{(topThree[2].poin || 0)} XP</Badge>
                    </div>
                  </>
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center">
                    <span className="text-slate-300 text-xs">#3</span>
                  </div>
                )}
              </div>
            </div>

            {/* List Peringkat */}
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b px-6 py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Papan Peringkat Lengkap</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-12 text-center text-[10px] font-bold">POS</TableHead>
                      <TableHead className="text-[10px] font-bold">SISWA</TableHead>
                      <TableHead className="text-right pr-6 text-[10px] font-bold">XP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayData.map((student, i) => (
                      <TableRow key={student.uid || i} className={`border-slate-50 transition-colors ${i < 3 ? 'bg-yellow-50/5' : ''}`}>
                        <TableCell className="text-center">
                          {i < 3 ? (
                            <Medal className={`h-5 w-5 mx-auto ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : 'text-amber-600'}`} />
                          ) : (
                            <span className="text-xs font-bold text-slate-300">{i + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-slate-100 shrink-0">
                               <img 
                                src={`https://picsum.photos/seed/${student.uid}/100/100`} 
                                alt={student.nama} 
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100/100?text=S' }}
                               />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate text-slate-800">{student.nama || "Siswa"}</p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase">LV. {Math.floor((student.poin || 0) / 100) + 1}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm font-bold text-primary font-mono">{student.poin || 0}</span>
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
