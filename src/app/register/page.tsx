'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function RegisterPage() {
  const { auth, db } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    peran: "siswa"
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const uid = userCredential.user.uid;

      const userRef = doc(db, "users", uid);
      const userData = {
        uid,
        nama: formData.name,
        email: formData.email,
        peran: formData.peran as 'siswa' | 'guru' | 'admin',
        level: 1,
        poin: 0,
        tanggalDaftar: serverTimestamp()
      };

      // Non-blocking mutation call
      setDoc(userRef, userData)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Selamat datang di ETHNO-ARITH!",
      });

      // Redirect based on role
      router.push(formData.peran === "guru" ? "/dashboard/teacher" : "/dashboard/student");
    } catch (error: any) {
      let message = "Terjadi kesalahan saat mendaftar.";
      if (error.code === "auth/email-already-in-use") {
        message = "Email sudah digunakan oleh pengguna lain.";
      } else if (error.code === "auth/weak-password") {
        message = "Kata sandi terlalu lemah (minimal 6 karakter).";
      } else if (error.code === "auth/invalid-email") {
        message = "Format email tidak valid.";
      }
      
      toast({
        variant: "destructive",
        title: "Gagal Mendaftar",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center p-6">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-headline font-bold text-xl">E</span>
        </div>
        <span className="font-headline font-bold text-2xl tracking-tight text-primary">ETHNO-ARITH</span>
      </Link>
      
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-3 bg-primary" />
        <CardHeader className="space-y-1 pt-8 text-center">
          <CardTitle className="text-3xl font-headline font-bold">Daftar Akun Baru</CardTitle>
          <CardDescription>Mulai petualangan matematikamu sekarang!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input 
                id="name" 
                placeholder="Budi Santoso" 
                className="h-12 bg-slate-50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@sekolah.edu" 
                className="h-12 bg-slate-50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input 
                id="password" 
                type="password" 
                className="h-12 bg-slate-50"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-3">
              <Label>Daftar Sebagai</Label>
              <RadioGroup 
                defaultValue="siswa" 
                onValueChange={(val) => setFormData({ ...formData, peran: val })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="siswa" id="siswa" />
                  <Label htmlFor="siswa">Siswa</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="guru" id="guru" />
                  <Label htmlFor="guru">Guru</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Daftar Sekarang"}
            </Button>
          </form>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Sudah punya akun?</span>{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">Masuk</Link>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-widest">Platform Edukasi Terpercaya</span>
      </div>
    </div>
  );
}
