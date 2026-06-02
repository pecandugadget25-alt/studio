'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Zap, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useUser();

  // Hide on auth pages or if no profile
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";
  const isArPage = pathname === "/ar-scan";
  
  if (isAuthPage || isArPage || !profile) return null;

  const navItems = [
    { label: "Home", icon: Home, href: "/dashboard/student" },
    { label: "Modul", icon: BookOpen, href: "/modules" },
    { label: "Tantangan", icon: Zap, href: "/challenges" },
    { label: "Peringkat", icon: Trophy, href: "/leaderboard" },
    { label: "Profil", icon: "/profile", isProfile: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white border-t bottom-nav-blur android-shadow flex items-center justify-around px-2 max-w-[500px] mx-auto">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        const href = item.isProfile ? `/profile` : item.href;

        return (
          <Link 
            key={item.label} 
            href={href as string}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            {item.isProfile ? (
              <div className={cn(
                "w-6 h-6 rounded-full overflow-hidden border-2",
                isActive ? "border-primary" : "border-transparent"
              )}>
                <img src={`https://picsum.photos/seed/${profile.uid}/100/100`} alt="Avatar" />
              </div>
            ) : (
              <Icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
            )}
            <span className={cn("text-[10px] font-bold uppercase tracking-wide")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}