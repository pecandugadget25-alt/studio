'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Camera, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useUser();

  // Hide on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  if (isAuthPage || !profile) return null;

  const navItems = [
    { label: "Beranda", icon: Home, href: "/" },
    { label: "Modul", icon: BookOpen, href: "/modules" },
    { label: "Scan AR", icon: Camera, href: "/ar-scan", isAction: true },
    { label: "Peringkat", icon: Trophy, href: "/leaderboard" },
    { label: "Profil", icon: User, href: "/profile", isProfile: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-white/90 border-t bottom-nav-blur android-shadow flex items-center justify-around px-2 max-w-[500px] mx-auto pb-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isAction) {
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex flex-col items-center justify-center -translate-y-6"
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-xl shadow-accent/40 border-4 border-white active:scale-95 transition-transform">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent mt-2">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 px-3 transition-all active:scale-90",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            {item.isProfile ? (
              <div className={cn(
                "w-7 h-7 rounded-full overflow-hidden border-2 transition-all",
                isActive ? "border-primary scale-110" : "border-transparent"
              )}>
                <img src={`https://picsum.photos/seed/${profile.uid}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <Icon className={cn("h-6 w-6 transition-all", isActive && "scale-110 fill-primary/10")} />
            )}
            <span className={cn("text-[10px] font-bold uppercase tracking-wider")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
