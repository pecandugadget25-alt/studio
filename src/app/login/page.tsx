
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ShieldCheck, Loader2, Box } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function LoginPage() {
  const { auth, db } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        
        // Log Activity: Login
        await addDoc(collection(db, "activities"), {
          userId: userCredential.user.uid,
          activityType: "login",
          title: "Masuk Akun",
          description: "Berhasil masuk ke aplikasi",
          xp: 0,
          timestamp: serverTimestamp()
        }).catch(console.warn);

        toast({
          title: "Berhasil Masuk",
          description: `Selamat datang kembali, ${profile.nama}!`,
        });

        if (profile.peran === "guru" || profile.peran === "admin") {
          router.push("/teacher");
        } else {
          router.push("/");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Profil Tidak Ditemukan",
          description: "Data profil Anda tidak ditemukan di sistem. Silakan hubungi admin.",
        });
      }
    } catch (error: any) {
      let message = "Email atau kata sandi salah. Silakan coba lagi.";
      if (error.code === "auth/user-not-found") message = "Akun tidak ditemukan.";
      else if (error.code === "auth/wrong-password") message = "Kata sandi salah.";
      else if (error.code === "auth/invalid-email") message = "Format email tidak valid.";

      toast({
        variant: "destructive",
        title: "Gagal Masuk",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="relative w-[120px] h-[120px] mb-2">
          {!imgError ? (
            <Image 
              src="/images/ethno-arith-logo.svg" 
              alt="ETHNO-ARITH Logo" 
              fill 
              className="object-contain"
              priority
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-primary rounded-3xl flex items-center justify-center shadow-lg">
              <Box className="h-16 w-16 text-white" />
            </div>
          )}
        </div>
        <div className="text-center">
          <h1 className="font-headline font-bold text-3xl tracking-tight text-primary">ETHNO-ARITH</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Ethnomathematics AR Learning Ecosystem</p>
        </div>
      </div>
      
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="h-3 bg-primary" />
        <CardHeader className="space-y-1 pt-8 text-center">
          <CardTitle className="text-2xl font-headline font-bold">Selamat Datang</CardTitle>
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
                className="h-12 bg-slate-50 rounded-2xl"
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
                className="h-12 bg-slate-50 rounded-2xl" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold rounded-2xl" disabled={loading}>
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
        <span className="text-xs font-bold uppercase tracking-widest text-center px-4">Sistem Pembelajaran Aman & Terverifikasi</span>
      </div>
    </div>
  );
}
