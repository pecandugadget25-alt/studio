
'use client';

import { useUser } from "@/firebase";
import { Star, Box, Home, BookOpen, QrCode, Trophy, LayoutDashboard, Users, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppBar() {
  const { profile } = useUser();
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);

  if (!profile) return null;

  // Hanya tampilkan XP jika peran adalah 'siswa'
  const isStudent = profile.peran === 'siswa';
  const desktopNavItems = isStudent
      ? [
        { label: "Beranda", icon: Home, href: "/" },
        { label: "Komik", icon: BookOpen, href: "/komik" },
        { label: "Scan QR", icon: QrCode, href: "/scan" },
        { label: "Peringkat", icon: Trophy, href: "/leaderboard" },
      ]
    : [
        { label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
        { label: "Siswa", icon: Users, href: "/teacher/students" },
        { label: "Laporan", icon: FileText, href: "/teacher/reports" },
      ];

  return (
    <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white android-shadow">
      <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={isStudent ? "/" : "/teacher"} className="flex min-w-0 items-center gap-2">
          <div className="relative h-9 w-9 shrink-0">
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
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary">
                <Box className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <h1 className="truncate font-headline text-lg font-bold tracking-tight text-primary">ETHNO-ARITH</h1>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 px-6 md:flex">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="flex shrink-0 items-center gap-3">
          {isStudent && (
            <div className="flex items-center gap-1.5 rounded-2xl border border-accent/20 bg-accent/10 px-3 py-1.5">
              <Star className="h-4 w-4 fill-current text-accent" />
              <span className="text-xs font-bold text-accent">{profile.poin}</span>
            </div>
          )}
          <Link href="/profile" className="h-9 w-9 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-100 shadow-sm">
             <img 
              src={`https://picsum.photos/seed/${profile.uid}/100/100`} 
              alt="Profile" 
              className="h-full w-full object-cover" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/100/100?text=Avatar';
              }}
             />
          </Link>
        </div>
      </div>
    </div>
  );
}
