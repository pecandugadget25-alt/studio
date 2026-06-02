
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  FileText, 
  UserCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TeacherBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { label: "Siswa", icon: Users, href: "/teacher/students" },
    { label: "Aktivitas", icon: Activity, href: "/teacher/activity" },
    { label: "Laporan", icon: FileText, href: "/teacher/reports" },
    { label: "Profil", icon: UserCircle, href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white border-t android-shadow flex items-center justify-around px-2 max-w-[500px] mx-auto pb-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 transition-all active:scale-90",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <Icon className={cn("h-5 w-5 transition-all", isActive && "scale-110")} />
            <span className={cn("text-[9px] font-bold uppercase tracking-wider")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
