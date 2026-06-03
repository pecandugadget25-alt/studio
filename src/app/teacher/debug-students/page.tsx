'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RedirectToDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher");
  }, [router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
