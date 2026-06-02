
'use client';

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { TeacherBottomNav } from "./TeacherBottomNav";
import { useUser } from "@/firebase";

export function DynamicNav() {
  const pathname = usePathname();
  const { profile, loading } = useUser();

  if (loading) return null;

  const isTeacherRoute = pathname.startsWith('/teacher');
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) return null;

  // Render Teacher Nav if on teacher route OR if user is a teacher on the profile page
  if (isTeacherRoute) {
    return <TeacherBottomNav />;
  }

  return <BottomNav />;
}
