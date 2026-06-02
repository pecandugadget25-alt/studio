'use client';

import { useUser } from "@/firebase";
import { Star, Box } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function AppBar() {
  const { profile } = useUser();
  const [imgError, setImgError] = useState(false);

  if (!profile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white border-b border-slate-100 android-shadow max-w-[500px] mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative w-9 h-9">
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
            <div className="w-full h-full bg-primary rounded-lg flex items-center justify-center">
              <Box className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <h1 className="font-headline font-bold text-lg text-primary tracking-tight">ETHNO-ARITH</h1>
      </Link>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-2xl border border-accent/20">
          <Star className="h-4 w-4 text-accent fill-current" />
          <span className="text-xs font-bold text-accent">{profile.poin}</span>
        </div>
        <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-100">
           <img 
            src={`https://picsum.photos/seed/${profile.uid}/100/100`} 
            alt="Profile" 
            className="w-full h-full object-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/100/100?text=Avatar';
            }}
           />
        </Link>
      </div>
    </div>
  );
}
