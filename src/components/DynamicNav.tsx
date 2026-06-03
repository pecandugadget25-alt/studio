
'use client';

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { TeacherBottomNav } from "./TeacherBottomNav";
import { useUser } from "@/firebase";

export function DynamicNav() {
  const pathname = usePathname();
  const { profile, loading } = useUser();

  if (loading || !profile) return null;

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null;

  // Penentuan navigasi murni berdasarkan peran di database
  if (profile.peran === 'guru' || profile.peran === 'admin' || profile.peran === 'peneliti') {
    return <TeacherBottomNav />;
  }

  return <BottomNav />;
}
