'use client';

import { useUser } from "@/firebase";
import { Star, Bell } from "lucide-react";
import { Badge } from "./ui/badge";
import Image from "next/image";
import Link from "next/link";

export function AppBar() {
  const { profile } = useUser();

  if (!profile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 bg-white border-b android-shadow max-w-[500px] mx-auto">
      <Link href="/dashboard/student" className="flex items-center gap-2">
        <div className="relative w-10 h-10">
          <Image 
            src="/logo.png" 
            alt="ETHNO-ARITH Logo" 
            fill 
            className="object-contain"
            priority
          />
        </div>
        <h1 className="font-headline font-bold text-lg text-primary tracking-tight">ETHNO-ARITH</h1>
      </Link>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="text-xs font-bold text-yellow-700">{profile.poin}</span>
        </div>
        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
