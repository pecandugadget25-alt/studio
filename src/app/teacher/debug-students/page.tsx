
'use client';

import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Database, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DebugStudentsPage() {
  const db = useFirestore();

  const debugQuery = useMemo(() => {
    if (!db) return null;
    // Menggunakan query dasar untuk memastikan tidak ada error index
    return query(collection(db, "users"));
  }, [db]);

  const { data: allUsers, loading } = useCollection(debugQuery);

  const students = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => u.peran === 'siswa');
  }, [allUsers]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold animate-pulse">Menghubungkan ke Firestore...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[600px] mx-auto min-h-screen bg-slate-50">
      <Link href="/teacher">
        <Button variant="ghost" className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" /> Audit Data Siswa
        </h1>
        <p className="text-sm text-muted-foreground">Gunakan halaman ini untuk memverifikasi data di Firebase.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white border-none shadow-sm">
           <p className="text-[10px] font-bold text-slate-400 uppercase">Total Users</p>
           <p className="text-3xl font-bold">{allUsers?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-primary text-white border-none shadow-sm">
           <p className="text-[10px] font-bold opacity-80 uppercase">Filter Peran: Siswa</p>
           <p className="text-3xl font-bold">{students.length}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Daftar Dokumen Ditemukan:</h3>
        {students.length > 0 ? (
          students.map((s: any) => (
            <Card key={s.uid} className="p-4 bg-white border-none shadow-sm space-y-1">
               <p className="font-bold text-slate-900">{s.nama || 'Tanpa Nama'}</p>
               <p className="text-xs text-slate-400 font-mono">{s.email}</p>
               <div className="flex gap-4 pt-2 mt-2 border-t border-slate-50 text-[10px] font-bold text-primary uppercase">
                  <span>XP: {s.poin || 0}</span>
                  <span>LV: {s.level || 1}</span>
                  <span>ID: {s.uid?.substring(0, 8)}...</span>
               </div>
            </Card>
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed">
             <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
             <p className="text-sm font-medium text-slate-500">Tidak ada user dengan peran 'siswa' ditemukan.</p>
             <p className="text-[10px] text-slate-400 mt-1">Periksa koleksi 'users' di Firebase Console.</p>
          </div>
        )}
      </div>
    </div>
  );
}
