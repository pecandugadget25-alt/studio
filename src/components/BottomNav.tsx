'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Home, Trophy, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useUser();

  // Hide on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  if (isAuthPage || !profile) return null;

  const isLearningMode = pathname.startsWith('/komik/') || pathname.startsWith('/comics/');
  if (isLearningMode) return null;

  const navItems = [
    { label: "Home", icon: Home, href: "/", activePaths: ["/"] },
    // TODO: Point this to the dedicated learning route when the learning pages are integrated.
    { label: "Learning", icon: GraduationCap, href: "/komik", activePaths: ["/komik", "/comics"] },
    { label: "Leaderboard", icon: Trophy, href: "/leaderboard", activePaths: ["/leaderboard"] },
    { label: "Profile", icon: UserCircle, href: "/profile", activePaths: ["/profile"] },
  ];

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="bottom-nav-blur android-shadow fixed bottom-0 left-0 right-0 z-50 grid h-[72px] grid-cols-4 items-center border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 md:hidden"
    >
      {navItems.map((item) => {
        const isActive = item.activePaths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(path)));
        const Icon = item.icon;

        return (
          <Link 
            key={item.label} 
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center transition-all duration-300 ease-out active:scale-95",
              isActive ? "text-primary" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <span
              className={cn(
                "absolute top-0 h-1 w-8 rounded-full bg-primary opacity-0 transition-all duration-300 ease-out",
                isActive && "opacity-100"
              )}
            />
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300 ease-out",
                isActive ? "bg-primary/10 shadow-sm" : "bg-transparent group-hover:bg-slate-100"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-all duration-300 ease-out", isActive && "scale-110")} />
            </span>
            <span className="max-w-full truncate text-[10px] font-bold leading-none">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
