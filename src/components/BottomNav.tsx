'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Trophy, QrCode } from "lucide-react";
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
    { label: "Komik", icon: BookOpen, href: "/komik" },
    { label: "Scan QR", icon: QrCode, href: "/scan" },
    { label: "Peringkat", icon: Trophy, href: "/leaderboard" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 grid h-20 grid-cols-4 items-center border-t bg-white/90 px-2 pb-3 android-shadow bottom-nav-blur md:hidden">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href) && (item.href !== '/' || pathname === '/');
        const Icon = item.icon;

        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 px-2 transition-all active:scale-90",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <Icon className={cn("h-6 w-6 transition-all", isActive && "scale-110 fill-primary/10")} />
            <span className={cn("text-[10px] font-bold uppercase tracking-wider")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
