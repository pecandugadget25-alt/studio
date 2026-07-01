
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Castle, Landmark, Dices, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";

const MODULES = [
  {
    id: 'batik',
    name: 'Batik Nusantara',
    icon: MapPin,
    color: 'bg-orange-500',
    desc: 'Eksplorasi matematika dalam motif batik.',
  },
  {
    id: 'candi',
    name: 'Candi Nusantara',
    icon: Castle,
    color: 'bg-primary',
    desc: 'Belajar bangun ruang dari arsitektur candi.',
  },
  {
    id: 'masjid',
    name: 'Masjid Al Akbar',
    icon: Landmark,
    color: 'bg-emerald-600',
    desc: 'Analisis geometri pada struktur masjid.',
  },
  {
    id: 'games',
    name: 'Permainan Tradisional',
    icon: Dices,
    color: 'bg-red-500',
    desc: 'Strategi berhitung lewat permainan seru.',
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
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">CINARAI Learning</p>
        <h2 className="mt-2 text-3xl font-headline font-bold tracking-tight">Pilih Modul Budaya</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Temukan perjalanan belajar yang relevan dengan budaya dan sains melalui modul interaktif.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((mod) => {
          const isCompleted = profile?.completedModules?.includes(mod.id);
          return (
            <Card key={mod.id} className="border-none rounded-3xl overflow-hidden shadow-sm group transition-all duration-200 hover:-translate-y-0.5">
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${mod.id}-cover/600/400`}
                  alt={mod.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-3 rounded-full bg-white/10 px-3 py-2 text-white backdrop-blur-sm shadow-sm">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${mod.color}`}>
                    <mod.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/90">{mod.name}</div>
                </div>
              </div>

              <CardContent className="space-y-5 p-5">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Modul berbudaya</p>
                  <h3 className="text-lg font-semibold leading-snug">{mod.name}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{mod.desc}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span>Status</span>
                    <span>{isCompleted ? 'Selesai' : 'Belum dimulai'}</span>
                  </div>
                  <div className="rounded-full bg-slate-200/80 p-1">
                    <div className={`h-2 rounded-full ${isCompleted ? 'bg-primary' : 'bg-slate-400'}`} style={{ width: isCompleted ? '100%' : '16%' }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{isCompleted ? '100% lengkap' : 'Mulai dari awal'}</span>
                    <span>{isCompleted ? 'Selesai' : '5 tahap'}</span>
                  </div>
                </div>

                <Button variant="secondary" size="default" asChild className="w-full">
                  <Link href={`/modules/${mod.id}`}>{isCompleted ? 'Buka ulang modul' : 'Mulai belajar'}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
