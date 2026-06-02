
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Camera, ShieldCheck, ChevronRight, LayoutDashboard } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-illustration") || PlaceHolderImages[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="flex items-center gap-2">
          <div className="relative w-12 h-12">
            <Image 
              src="/logo.png" 
              alt="ETHNO-ARITH Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">ETHNO-ARITH</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Fitur</Link>
          <Link href="#modules" className="text-sm font-medium hover:text-primary transition-colors">Modul</Link>
          <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">Tentang</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button className="text-sm font-medium bg-primary hover:bg-primary/90">Daftar Sekarang</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 px-6 lg:px-12 bg-[#FAF7F5] overflow-hidden">
          <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 z-10">
              <Badge variant="outline" className="border-accent text-accent px-4 py-1 font-headline">
                Belajar Numerasi Jadi Seru!
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-headline font-bold leading-tight text-foreground">
                Belajar Matematika <br />
                <span className="text-primary">Warisan Budaya</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Tingkatkan kemampuan numerasi melalui keajaiban Batik, kemegahan Candi, dan permainan tradisional Nusantara dengan teknologi Augmented Reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 h-14 text-lg font-headline shadow-lg hover:shadow-primary/20">
                    Mulai Belajar <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard/student">
                  <Button size="lg" variant="outline" className="px-8 h-14 text-lg font-headline">
                    Demo Siswa <LayoutDashboard className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-auto h-[500px] w-full bg-accent/10 rounded-3xl overflow-hidden border-8 border-white shadow-2xl rotate-2">
              <Image 
                src={heroImage.imageUrl} 
                alt="ETHNO-ARITH Hero Illustration" 
                fill 
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-24 right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 lg:px-12 bg-white">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-headline font-bold">Fitur Utama Ekosistem Kami</h2>
              <p className="text-muted-foreground">Dikembangkan khusus untuk mendukung kurikulum Merdeka Belajar dengan pendekatan kebudayaan Indonesia.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: BookOpen, title: "Modul Etnomatematika", desc: "Hubungkan geometri dengan Batik dan Candi." },
                { icon: Trophy, title: "Gamifikasi Adaptif", desc: "Sistem poin, level, dan badge prestasi." },
                { icon: Camera, title: "Augmented Reality", desc: "Visualisasi 3D bangun ruang secara nyata." },
                { icon: ShieldCheck, title: "Monitoring Guru", desc: "Pantau perkembangan siswa secara detail." },
              ].map((feature, idx) => (
                <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow bg-[#FAF7F5]">
                  <CardContent className="pt-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-headline font-bold text-xl">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Module Preview */}
        <section id="modules" className="py-24 px-6 lg:px-12 bg-[#FAF7F5]">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-headline font-bold">Modul Pembelajaran</h2>
                <p className="text-muted-foreground">Eksplorasi matematika melalui warisan luhur bangsa.</p>
              </div>
              <Button variant="link" className="text-primary font-bold text-lg p-0 h-auto">Lihat Semua Modul <ChevronRight className="ml-1" /></Button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { id: "batik", title: "Batik Nusantara", topic: "Simetri & Pola", img: "batik-pattern" },
                { id: "candi", title: "Candi Nusantara", topic: "Geometri Bangun Ruang", img: "borobudur-temple" },
              ].map((module, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-3xl h-80 shadow-lg cursor-pointer">
                  <Image 
                    src={`https://picsum.photos/seed/${module.id}/800/600`} 
                    alt={module.title} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105"
                    data-ai-hint="indonesian culture"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 p-8 space-y-2">
                    <Badge className="bg-accent text-accent-foreground font-headline">{module.topic}</Badge>
                    <h3 className="text-3xl font-headline font-bold text-white">{module.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 px-6 lg:px-12">
        <div className="container mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4 col-span-2">
            <h3 className="font-headline font-bold text-2xl">ETHNO-ARITH</h3>
            <p className="max-w-md opacity-80 leading-relaxed">
              Platform edukasi masa depan yang menggabungkan kecerdasan buatan, 
              teknologi AR, dan kearifan lokal untuk melahirkan generasi yang mahir numerasi.
            </p>
          </div>
          <div>
            <h4 className="font-headline font-bold mb-6">Navigasi</h4>
            <ul className="space-y-4 opacity-80 text-sm">
              <li><Link href="#">Dashboard Siswa</Link></li>
              <li><Link href="#">Portal Guru</Link></li>
              <li><Link href="#">Admin Panel</Link></li>
              <li><Link href="#">Panduan AR</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold mb-6">Kontak</h4>
            <ul className="space-y-4 opacity-80 text-sm">
              <li>info@ethno-arith.edu</li>
              <li>Jakarta, Indonesia</li>
              <li>Tahun Penelitian 2024</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto mt-16 pt-8 border-t border-white/10 text-center opacity-60 text-xs">
          © 2024 ETHNO-ARITH Research Team. Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
}
