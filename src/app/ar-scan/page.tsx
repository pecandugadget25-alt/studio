
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, RefreshCw, Layers, Box, Info } from "lucide-react";
import Link from "next/link";

export default function ARScanPage() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="relative flex h-screen min-w-0 flex-col overflow-hidden bg-black">
      {/* Header Overlay */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 p-4 sm:p-6">
        <Link href="/dashboard/student" className="pointer-events-auto">
          <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 text-white rounded-full h-12 w-12 p-0">
            <X className="h-6 w-6" />
          </Button>
        </Link>
        <div className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 text-white backdrop-blur-md sm:px-4">
          <Camera className="h-4 w-4" />
          <span className="truncate text-sm font-medium">Scanner AR ETHNO-ARITH</span>
        </div>
        <Button variant="outline" className="pointer-events-auto bg-black/40 backdrop-blur-md border-white/20 text-white rounded-full h-12 w-12 p-0">
          <Info className="h-6 w-6" />
        </Button>
      </div>

      {/* AR Viewport Placeholder */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
        {!isActive ? (
          <div className="w-full max-w-md space-y-6 px-4 text-center sm:px-8">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse border-2 border-dashed border-white/40">
              <Camera className="h-10 w-10 text-white/60" />
            </div>
            <h2 className="text-white text-2xl font-headline font-bold">Mulai Visualisasi AR</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Arahkan kamera ke materi pembelajaran atau marker khusus untuk melihat visualisasi 3D bangun ruang dan pola batik.
            </p>
            <Button size="lg" className="w-full h-14 text-lg font-bold bg-primary" onClick={() => setIsActive(true)}>
              Aktifkan Kamera
            </Button>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Camera View Overlay */}
            <div className="pointer-events-none absolute inset-0 border-[20px] border-black/20 sm:border-[40px]" />
            
            {/* Simulation of a detected object */}
            <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-3xl border-2 border-accent/60 sm:h-64 sm:w-64">
               <div className="absolute -top-12 left-1/2 max-w-[80vw] -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground shadow-lg">
                Mendeteksi Pola Batik...
               </div>
            </div>

            {/* Simulation background */}
            <div className="w-full h-full bg-[url('https://picsum.photos/seed/ar-view/1920/1080')] bg-cover bg-center opacity-40" />
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 flex h-32 items-center justify-center gap-4 bg-gradient-to-t from-black to-transparent px-4 pb-6 sm:gap-8 sm:px-6">
          <Button variant="outline" className="h-16 min-w-0 flex-1 max-w-[120px] flex-col gap-1 border-white/20 bg-white/10 text-white">
            <Layers className="h-5 w-5" />
            <span className="text-[10px] uppercase font-bold">Lapisan</span>
          </Button>
          <div className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border-4 border-primary bg-white p-1 transition-transform active:scale-95 sm:h-20 sm:w-20">
             <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
               <Box className="h-10 w-10 text-primary" />
             </div>
          </div>
          <Button variant="outline" className="h-16 min-w-0 flex-1 max-w-[120px] flex-col gap-1 border-white/20 bg-white/10 text-white" onClick={() => setIsActive(false)}>
            <RefreshCw className="h-5 w-5" />
            <span className="text-[10px] uppercase font-bold">Reset</span>
          </Button>
        </div>
      )}

      {/* Helper Toast in AR view */}
      {isActive && (
        <div className="absolute left-1/2 top-24 z-10 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
          <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-4 text-white">
            <p className="text-xs text-center">Tips: Gerakkan kamera secara perlahan untuk mendeteksi permukaan datar.</p>
          </Card>
        </div>
      )}
    </div>
  );
}
