
'use client';

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  Search, 
  TrendingUp, 
  AlertCircle,
  MoreVertical,
  Download,
  LogOut,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useUser, useFirebase } from "@/firebase";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";

const chartData = [
  { module: "Batik", average: 82 },
  { module: "Candi", average: 64 },
  { module: "Masjid", average: 71 },
  { module: "Permainan", average: 88 },
];

const chartConfig = {
  average: {
    label: "Rata-rata Nilai",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function TeacherDashboard() {
  const router = useRouter();
  const { auth } = useFirebase();
  const { user, profile, loading: authLoading } = useUser();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Guru */}
      <aside className="w-64 border-r bg-white hidden lg:flex flex-col">
        <div className="p-6 h-16 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">EA</div>
          <span className="font-headline font-bold text-primary">Panel GURU</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20">
            <Users className="h-4 w-4" /> Beranda Guru
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <BarChart3 className="h-4 w-4" /> Analisis Belajar
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" /> Bank Soal
          </Button>
        </nav>
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <Settings className="h-4 w-4" /> Pengaturan
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-auto">
        <header className="h-16 border-b bg-white px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <h1 className="font-headline font-bold text-lg">Ringkasan Aktivitas Siswa</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="font-bold border-primary text-primary">Kelas 5-A</Badge>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {profile.nama.charAt(0)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Siswa", value: "32", sub: "+2 minggu ini", icon: Users },
              { title: "Kuis Selesai", value: "148", sub: "Rata-rata 4.6/siswa", icon: FileText },
              { title: "Rata-rata Skor", value: "76.4", sub: "Meningkat 5%", icon: TrendingUp },
              { title: "Siswa Perlu Bantuan", value: "5", sub: "Skor < 60", icon: AlertCircle },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      <p className={`text-xs ${i === 3 ? 'text-destructive font-bold' : 'text-green-600'}`}>
                        {stat.sub}
                      </p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <stat.icon className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Performa Rata-rata per Modul</CardTitle>
                <CardDescription>Visualisasi tingkat penguasaan numerasi siswa</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="module" axisLine={false} tickLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="average" fill="var(--color-average)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                <CardDescription>Siswa yang baru saja menyelesaikan modul</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Budi Santoso", module: "Batik Simetri", score: 85, time: "2 menit lalu" },
                  { name: "Siti Aminah", module: "Geometri Candi", score: 45, time: "15 menit lalu" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.module}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={item.score > 80 ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-orange-100 text-orange-700 hover:bg-orange-100'}>
                        {item.score}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider">Lihat Log Aktivitas</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
