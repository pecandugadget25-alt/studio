
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  Settings, 
  Award, 
  History, 
  ShieldCheck, 
  Mail, 
  Loader2, 
  Star, 
  Trophy,
  LayoutDashboard,
  Users
} from "lucide-react";
import { useUser, useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BADGE_CONFIG: Record<string, { icon: any, color: string }> = {
  "Ahli Geometri Batik": { icon: Star, color: "bg-orange-100 text-orange-600" },
  "Penjelajah Candi Nusantara": { icon: ShieldCheck, color: "bg-blue-100 text-blue-600" },
  "Ahli Matematika Masjid": { icon: Award, color: "bg-emerald-100 text-emerald-600" },
  "Juara Numerasi": { icon: Trophy, color: "bg-red-100 text-red-600" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { profile, loading } = useUser();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  if (loading || !profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isTeacher = profile.peran === 'guru' || profile.peran === 'admin';

  return (
    <div className="pt-20 pb-24 px-4 space-y-6 max-w-[500px] mx-auto min-h-screen bg-slate-50/50">
      {/* Profile Header */}
      <div className="flex flex-col items-center space-y-3 py-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
            <img src={`https://picsum.photos/seed/${profile.uid}/200/200`} alt="Profile" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full border-2 border-white shadow-lg">
            <Settings className="h-4 w-4" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-headline font-bold">{profile.nama}</h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Mail className="h-3.5 w-3.5" />
            <span>{profile.email}</span>
          </div>
        </div>
        <Badge variant="secondary" className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          {isTeacher ? `Panel ${profile.peran}` : `Siswa Level ${profile.level}`}
        </Badge>
      </div>

      {/* Stats Grid for Students */}
      {!isTeacher && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none rounded-2xl bg-white shadow-sm p-4 text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Poin</p>
            <div className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-xl font-bold">{profile.poin}</span>
            </div>
          </Card>
          <Card className="border-none rounded-2xl bg-white shadow-sm p-4 text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Modul Selesai</p>
            <div className="flex items-center justify-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">{profile.completedModules?.length || 0}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Badges Section for Students */}
      {!isTeacher && (
        <Card className="border-none rounded-2xl bg-white shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" /> Koleksi Lencana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 py-2">
              {Object.entries(BADGE_CONFIG).map(([name, config]) => {
                const isOwned = profile.badges?.includes(name);
                const Icon = config.icon;
                return (
                  <div 
                    key={name} 
                    className={`flex flex-col items-center gap-1 transition-opacity ${isOwned ? 'opacity-100' : 'opacity-20'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color} shadow-inner`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[8px] font-bold text-center max-w-[50px] leading-tight uppercase">
                      {name.split(' ').slice(-1)}
                    </span>
                  </div>
                );
              })}
            </div>
            {(!profile.badges || profile.badges.length === 0) && (
              <p className="text-[10px] text-center text-muted-foreground italic py-4">
                Belum ada lencana. Selesaikan kuis untuk mendapatkannya!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Menu Actions */}
      <div className="space-y-3">
        {isTeacher && (
          <Link href="/teacher" className="block w-full">
            <Button className="w-full justify-start h-16 rounded-3xl gap-4 bg-primary hover:bg-primary/90 text-sm font-bold shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-6 w-6" />
              Dashboard Guru
            </Button>
          </Link>
        )}
        
        {isTeacher && (
          <Button variant="outline" className="w-full justify-start h-14 rounded-3xl gap-4 border-slate-100 bg-white text-sm font-bold">
            <Users className="h-5 w-5 text-slate-400" /> Kelola Siswa
          </Button>
        )}

        {!isTeacher && (
          <Button variant="outline" className="w-full justify-start h-14 rounded-3xl gap-4 border-slate-100 bg-white text-sm font-bold">
            <History className="h-5 w-5 text-slate-400" /> Riwayat Pembelajaran
          </Button>
        )}

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start h-14 rounded-3xl gap-4 text-destructive hover:bg-destructive/5 text-sm font-bold"
        >
          <LogOut className="h-5 w-5" /> Keluar dari Akun
        </Button>
      </div>
    </div>
  );
}
