
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, X, RefreshCw, Layers, Box, Info } from "lucide-react";
import Link from "next/link";

export default function ARScanPage() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="relative h-screen bg-black overflow-hidden flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between pointer-events-none">
        <Link href="/dashboard/student" className="pointer-events-auto">
          <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 text-white rounded-full h-12 w-12 p-0">
            <X className="h-6 w-6" />
          </Button>
        </Link>
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
          <Camera className="h-4 w-4" />
          <span className="text-sm font-medium">Scanner AR ETHNO-ARITH</span>
        </div>
        <Button variant="outline" className="pointer-events-auto bg-black/40 backdrop-blur-md border-white/20 text-white rounded-full h-12 w-12 p-0">
          <Info className="h-6 w-6" />
        </Button>
      </div>

      {/* AR Viewport Placeholder */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
        {!isActive ? (
          <div className="text-center space-y-6 px-12 max-w-md">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse border-2 border-dashed border-white/40">
              <Camera className="h-10 w-10 text-white/60" />
            </div>
            <h2 className="text-white text-2xl font-headline font-bold">Mulai Visualisasi AR</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Arahkan kamera ke modul pembelajaran atau marker khusus untuk melihat visualisasi 3D bangun ruang dan pola batik.
            </p>
            <Button size="lg" className="w-full h-14 text-lg font-bold bg-primary" onClick={() => setIsActive(true)}>
              Aktifkan Kamera
            </Button>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Camera View Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none" />
            
            {/* Simulation of a detected object */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-accent/60 rounded-3xl animate-pulse">
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-accent text-accent-foreground px-4 py-1 rounded-full text-xs font-bold shadow-lg">
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
        <div className="h-32 bg-gradient-to-t from-black to-transparent absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8 px-6 pb-6">
          <Button variant="outline" className="flex-1 max-w-[120px] bg-white/10 border-white/20 text-white flex-col h-16 gap-1">
            <Layers className="h-5 w-5" />
            <span className="text-[10px] uppercase font-bold">Lapisan</span>
          </Button>
          <div className="w-20 h-20 bg-white rounded-full border-4 border-primary p-1 flex items-center justify-center cursor-pointer active:scale-95 transition-transform">
             <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
               <Box className="h-10 w-10 text-primary" />
             </div>
          </div>
          <Button variant="outline" className="flex-1 max-w-[120px] bg-white/10 border-white/20 text-white flex-col h-16 gap-1" onClick={() => setIsActive(false)}>
            <RefreshCw className="h-5 w-5" />
            <span className="text-[10px] uppercase font-bold">Reset</span>
          </Button>
        </div>
      )}

      {/* Helper Toast in AR view */}
      {isActive && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
          <Card className="bg-black/60 backdrop-blur-lg border-white/20 p-4 text-white">
            <p className="text-xs text-center">Tips: Gerakkan kamera secara perlahan untuk mendeteksi permukaan datar.</p>
          </Card>
        </div>
      )}
    </div>
  );
}
