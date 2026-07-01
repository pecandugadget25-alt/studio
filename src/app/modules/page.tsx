
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Castle, Landmark, Dices, ChevronRight, Star, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";

const MODULES = [
  { 
    id: 'batik', 
    name: 'Batik Nusantara', 
    icon: MapPin, 
    color: 'bg-orange-500', 
    tag: 'Simetri',
    desc: 'Eksplorasi matematika dalam motif batik.'
  },
  { 
    id: 'candi', 
    name: 'Candi Nusantara', 
    icon: Castle, 
    color: 'bg-primary', 
    tag: 'Geometri',
    desc: 'Belajar bangun ruang dari arsitektur candi.'
  },
  { 
    id: 'masjid', 
    name: 'Masjid Al Akbar', 
    icon: Landmark, 
    color: 'bg-emerald-600', 
    tag: 'Numerasi',
    desc: 'Analisis geometri pada struktur masjid.'
  },
  { 
    id: 'games', 
    name: 'Permainan Tradisional', 
    icon: Dices, 
    color: 'bg-red-500', 
    tag: 'Logika',
    desc: 'Strategi berhitung lewat permainan seru.'
  },
];

export default function ModulesPage() {
  const { profile, loading } = useUser();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl space-y-6 overflow-y-auto px-4 pb-32 pt-20 sm:px-6 lg:px-8">
      <div className="px-1">
        <h2 className="text-2xl font-headline font-bold">Modul Budaya</h2>
        <p className="text-xs text-muted-foreground">Pilih materi yang ingin kamu pelajari hari ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((mod) => {
          const isCompleted = profile?.completedModules?.includes(mod.id);
          return (
            <Link key={mod.id} href={`/modules/${mod.id}`}>
              <Card className="border-none rounded-3xl overflow-hidden shadow-sm group active:scale-[0.98] transition-all">
                <CardContent className="p-0 flex flex-col">
                  <div className="relative h-32 w-full">
                    <img 
                      src={`https://picsum.photos/seed/${mod.id}-cover/600/400`} 
                      alt={mod.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className={`w-8 h-8 ${mod.color} rounded-lg flex items-center justify-center text-white`}>
                        <mod.icon className="h-4 w-4" />
                      </div>
                      <Badge className="bg-white/20 text-white backdrop-blur-md border-none text-[10px] uppercase font-bold tracking-widest">
                        {mod.tag}
                      </Badge>
                    </div>
                    {isCompleted && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-1">
                    <h3 className="font-bold text-base">{mod.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{mod.desc}</p>
                    <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase">
                        <Clock className="h-3 w-3" />
                        <span>Estimasi 15 Menit</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
