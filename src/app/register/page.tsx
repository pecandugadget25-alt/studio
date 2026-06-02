"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function RegisterPage() {
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
          <CardDescription>Mulai petualangan numerasimu sekarang!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" placeholder="Budi Santoso" className="h-12 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nama@sekolah.edu" className="h-12 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input id="password" type="password" className="h-12 bg-slate-50" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button className="w-full h-12 text-lg font-bold">Daftar Sekarang</Button>
            <p className="text-xs text-center text-muted-foreground px-4">
              Dengan mendaftar, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
            </p>
          </div>
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
