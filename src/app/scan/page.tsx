'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  X, 
  Image as ImageIcon, 
  RefreshCw, 
  Info, 
  Loader2, 
  Zap, 
  ShieldCheck,
  Video,
  BookOpen,
  PlayCircle,
  Box,
  CheckCircle2,
  AlertCircle,
  History,
  ChevronRight,
  Star,
  QrCode
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment, addDoc, collection, serverTimestamp, query, where, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SmartScannerPage() {
  const router = useRouter();
  const { profile, user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch recent history
  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "scan_logs"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(3)
    );
  }, [db, user?.uid]);

  const { data: recentScans } = useCollection(historyQuery);

  // RIGOROUS CLEANUP ON UNMOUNT
  useEffect(() => {
    const stopEverything = async () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch (e) {
            console.warn("Cleanup stop failed", e);
          }
        }
        try {
          scannerRef.current.clear();
        } catch (e) {}
        scannerRef.current = null;
      }
    };

    return () => {
      stopEverything();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    } else {
      setIsCameraActive(false);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setScanResult(null);
      
      // Clear existing scanner instance if any
      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {} // Silent on scan failure (seeking)
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Gagal mengakses kamera.";
      setError(msg.includes("Permission denied") ? "Izin kamera ditolak. Silakan aktifkan di pengaturan browser." : msg);
      setIsCameraActive(false);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Immediate stop to free camera
    await stopScanner();
    
    // UI feedback
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch (e) {}

    await handleQRAction(decodedText, 'camera');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setScanResult(null);
    
    // Temporary instance for file scanning
    const html5QrCode = new Html5Qrcode("reader-hidden");
    
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleQRAction(decodedText, 'gallery');
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "QR Tidak Ditemukan",
        description: "Gambar tidak terbaca sebagai QR Code valid.",
      });
      setIsProcessing(false);
    } finally {
      html5QrCode.clear();
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleQRAction = async (rawText: string, source: 'camera' | 'gallery') => {
    if (!db || !user || !profile) {
      setIsProcessing(false);
      return;
    }

    let type: 'video' | 'module' | 'comic' | 'quiz' | 'ar' | 'unknown' = 'unknown';
    let value = rawText;
    let xp = 0;
    let targetUrl = "";

    // Security & Parsing Logic
    if (rawText.includes('youtube.com') || rawText.includes('youtu.be') || rawText.startsWith('video:')) {
      type = 'video';
      xp = 5;
      value = rawText.replace('video:', '');
      targetUrl = `/video/${encodeURIComponent(value)}`;
    } else if (rawText.startsWith('module:')) {
      type = 'module';
      xp = 3;
      value = rawText.replace('module:', '');
      targetUrl = `/modules/${value}`;
    } else if (rawText.startsWith('comic:')) {
      type = 'comic';
      xp = 2;
      value = rawText.replace('comic:', '');
      targetUrl = `/komik/${value}`;
    } else if (rawText.startsWith('quiz:')) {
      type = 'quiz';
      xp = 20;
      value = rawText.replace('quiz:', '');
      const [modId] = value.split('/');
      targetUrl = `/modules/${modId}/quiz`;
    } else if (rawText.startsWith('ar:')) {
      type = 'ar';
      xp = 10;
      value = rawText.replace('ar:', '');
      targetUrl = `/ar-scan?id=${value}`;
    }

    if (type === 'unknown') {
      toast({
        variant: "destructive",
        title: "QR Tidak Terdaftar",
        description: "Format QR Code tidak dikenal oleh ETHNO-ARITH.",
      });
      setIsProcessing(false);
      return;
    }

    try {
      const logData = {
        uid: user.uid,
        studentName: profile.nama,
        qrType: type,
        qrValue: value,
        source,
        xpEarned: xp,
        timestamp: serverTimestamp()
      };

      const activityData = {
        userId: user.uid,
        userName: profile.nama,
        action: `memindai QR ${type}: ${value}`,
        type: 'scan',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, "scan_logs"), logData);
      await addDoc(collection(db, "activities"), activityData);
      
      const userRef = doc(db, "users", user.uid);
      const newScanCount = (profile.scanCount || 0) + 1;
      
      const updatePayload: any = {
        poin: increment(xp),
        scanCount: increment(1)
      };

      // Achievement Logic
      if (newScanCount === 1) updatePayload.badges = arrayUnion("Explorer QR");
      else if (newScanCount === 10) updatePayload.badges = arrayUnion("Pemburu Pengetahuan");
      else if (newScanCount === 50) updatePayload.badges = arrayUnion("Master Eksplorasi");
      else if (newScanCount === 100) updatePayload.badges = arrayUnion("Legenda ETHNO");

      await updateDoc(userRef, updatePayload);

      setScanResult({ type, xp, targetUrl, value });
      setIsProcessing(false);

      toast({
        title: "Pindaian Berhasil! 🎯",
        description: `Mendapatkan +${xp} XP untuk ${type}.`,
      });

    } catch (err) {
      console.error("Firestore sync error", err);
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: "Terjadi gangguan koneksi saat menyimpan data.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 flex flex-col max-w-[500px] mx-auto overflow-y-auto overflow-x-hidden">
      <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent fill-current" />
          Smart QR Scanner
        </h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-6">
        {/* Scanner Viewport */}
        <div className="relative bg-slate-900 aspect-square overflow-hidden shadow-inner w-full">
          <div id="reader" className="w-full h-full"></div>
          <div id="reader-hidden" className="hidden"></div>
          
          {!isCameraActive && !isProcessing && !scanResult && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-dashed border-white/20">
                <Camera className="h-10 w-10 text-white/40" />
              </div>
              <p className="text-white/60 text-sm font-medium">Aktifkan kamera untuk memindai materi ETHNO-ARITH.</p>
              <Button size="lg" className="bg-accent hover:bg-accent/90 font-bold px-8 h-14 rounded-2xl" onClick={startCamera}>
                Mulai Kamera
              </Button>
            </div>
          )}

          {isCameraActive && !isProcessing && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-xl" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent/40 animate-[scan_2s_ease-in-out_infinite] blur-sm" />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto bg-black/60 text-white border-white/20 rounded-full font-bold gap-2 backdrop-blur-md"
                onClick={stopScanner}
              >
                <X className="h-4 w-4" /> Berhenti
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="text-white font-bold tracking-tight">Memproses pindaian...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4 bg-destructive/10 z-20">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-center text-sm font-medium text-destructive-foreground px-4">{error}</p>
              <Button variant="outline" className="bg-white" onClick={startCamera}>Coba Lagi</Button>
            </div>
          )}
        </div>

        {/* Scan Result */}
        {scanResult && (
          <section className="px-6 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none rounded-[2rem] bg-white shadow-xl shadow-accent/5 overflow-hidden border-2 border-accent/20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    {scanResult.type === 'video' && <PlayCircle className="h-7 w-7" />}
                    {scanResult.type === 'module' && <BookOpen className="h-7 w-7" />}
                    {scanResult.type === 'quiz' && <CheckCircle2 className="h-7 w-7" />}
                    {scanResult.type === 'ar' && <Box className="h-7 w-7" />}
                    {scanResult.type === 'comic' && <ImageIcon className="h-7 w-7" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none mb-1">Berhasil Memindai</p>
                    <h3 className="font-bold text-lg text-slate-900 truncate uppercase">Akses {scanResult.type}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-sm font-bold text-slate-700">Hadiah</span>
                  </div>
                  <span className="text-xl font-bold text-accent">+{scanResult.xp} XP</span>
                </div>

                <Button className="w-full h-14 rounded-2xl font-bold text-lg gap-2 shadow-lg shadow-primary/20" onClick={() => router.push(scanResult.targetUrl)}>
                  Buka Sekarang <ChevronRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Controls */}
        <section className="px-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={isCameraActive ? 'default' : 'outline'}
              className={cn(
                "h-24 rounded-3xl flex-col gap-2 font-bold border-2 transition-all",
                isCameraActive ? "bg-primary border-primary text-white scale-105" : "bg-white border-slate-100 text-slate-600 shadow-sm"
              )}
              onClick={startCamera}
            >
              <Camera className="h-7 w-7" />
              <span className="text-[10px] uppercase tracking-wide">Kamera</span>
            </Button>

            <Button 
              variant="outline"
              className="h-24 rounded-3xl bg-white border-slate-100 border-2 flex-col gap-2 font-bold text-slate-600 shadow-sm active:scale-95 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-7 w-7" />
              <span className="text-[10px] uppercase tracking-wide">Galeri</span>
            </Button>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />

          <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100 flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-primary uppercase">Misi Eksplorasi</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">Gunakan scanner untuk menemukan rahasia matematika di sekitarmu!</p>
            </div>
          </div>
        </section>

        {/* History */}
        <section className="px-6 space-y-4 pb-10">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" /> Riwayat
            </h3>
          </div>
          <div className="space-y-3">
            {recentScans && recentScans.length > 0 ? (
              recentScans.map((log: any) => (
                <Card key={log.id} className="rounded-2xl border-none p-4 bg-white shadow-sm hover:bg-slate-50 transition-colors border border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 capitalize">{log.qrType}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{log.qrValue}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-accent">+{log.xpEarned} XP</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-xs text-center text-muted-foreground py-6 italic">Belum ada pindaian terbaru.</p>
            )}
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
