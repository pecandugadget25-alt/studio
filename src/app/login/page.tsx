
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { auth, db } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        toast({
          title: "Berhasil Masuk",
          description: `Selamat datang kembali, ${profile.nama}!`,
        });

        if (profile.peran === "guru") {
          router.push("/dashboard/teacher");
        } else if (profile.peran === "admin") {
          router.push("/dashboard/teacher"); // Sementara ke dashboard guru untuk admin
        } else {
          router.push("/dashboard/student");
        }
      } else {
        throw new Error("Profil pengguna tidak ditemukan.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Masuk",
        description: "Email atau kata sandi salah. Silakan coba lagi.",
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
          <CardTitle className="text-3xl font-headline font-bold">Selamat Datang Kembali</CardTitle>
          <CardDescription>Ayo lanjutkan petualangan matematikamu!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Kata Sandi</Label>
                <Link href="#" className="text-xs text-primary font-bold hover:underline">Lupa sandi?</Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                className="h-12 bg-slate-50" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Masuk"}
            </Button>
          </form>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Belum punya akun?</span>{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">Daftar Gratis</Link>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-widest">Sistem Pembelajaran Aman & Terverifikasi</span>
      </div>
    </div>
  );
}
