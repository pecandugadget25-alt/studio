'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TeacherBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { label: "Siswa", icon: Users, href: "/teacher/students" },
    { label: "Laporan", icon: FileText, href: "/teacher/reports" },
    { label: "Profil", icon: UserCircle, href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t bg-white px-1 pb-2 android-shadow md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/teacher' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-1 transition-all active:scale-90",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <Icon className={cn("h-5 w-5 transition-all", isActive && "scale-110")} />
            <span className={cn("text-[10px] font-bold uppercase tracking-wider text-center")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
