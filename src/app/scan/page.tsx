'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  Zap, 
  BookOpen, 
  PlayCircle, 
  ChevronRight, 
  History,
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
  const [scanResult, setScanResult] = useState<any>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.warn);
      }
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
      setScanResult(null);
      if (scannerRef.current) await stopScanner();

      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {} 
      );
      setIsCameraActive(true);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Akses Kamera Gagal",
        description: "Pastikan Anda memberikan izin kamera pada browser.",
      });
      setIsCameraActive(false);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    await stopScanner();
    await handleQRAction(decodedText, 'camera');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;

    setIsProcessing(true);
    const html5QrCode = new Html5Qrcode("reader-hidden");
    
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleQRAction(decodedText, 'gallery');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "QR Tidak Terdeteksi",
        description: "Pastikan gambar berisi QR Code yang jelas.",
      });
      setIsProcessing(false);
    } finally {
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
        title: "QR Tidak Valid",
        description: "QR Code ini tidak dikenali oleh sistem ETHNO-ARITH.",
      });
      setIsProcessing(false);
      return;
    }

    try {
      await addDoc(collection(db, "scan_logs"), {
        uid: user.uid,
        studentName: profile.nama,
        qrType: type,
        qrValue: value,
        source,
        xpEarned: xp,
        timestamp: serverTimestamp()
      });
      
      const newScanCount = (profile.scanCount || 0) + 1;
      const updatePayload: any = {
        poin: increment(xp),
        scanCount: increment(1)
      };

      if (newScanCount === 1) updatePayload.badges = arrayUnion("Explorer QR");
      else if (newScanCount === 10) updatePayload.badges = arrayUnion("Pemburu Pengetahuan");

      await updateDoc(doc(db, "users", user.uid), updatePayload);
      setScanResult({ type, xp, targetUrl });
      setIsProcessing(false);

      toast({
        title: "Berhasil!",
        description: `Mendapatkan +${xp} XP dari pindaian ${type}.`,
      });
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 flex flex-col max-w-[500px] mx-auto overflow-y-auto">
      <header className="sticky top-0 z-50 h-16 bg-white border-b flex items-center justify-between px-6">
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
        <div className="relative bg-slate-900 aspect-square overflow-hidden shadow-inner w-full max-h-[60vh]">
          <div id="reader" className="w-full h-full"></div>
          <div id="reader-hidden" className="hidden"></div>
          
          {!isCameraActive && !isProcessing && !scanResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-dashed border-white/20">
                <Camera className="h-10 w-10 text-white/40" />
              </div>
              <p className="text-white/60 text-sm font-medium">Klik tombol di bawah untuk mulai memindai.</p>
              <Button size="lg" className="bg-accent hover:bg-accent/90 font-bold px-8 h-14 rounded-2xl" onClick={startCamera}>
                Mulai Kamera
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="text-white font-bold tracking-tight">Memproses pindaian...</p>
            </div>
          )}
        </div>

        {scanResult && (
          <section className="px-6">
            <Card className="border-none rounded-[2rem] bg-white shadow-xl border-2 border-accent/20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    {scanResult.type === 'video' ? <PlayCircle className="h-7 w-7" /> : <BookOpen className="h-7 w-7" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-accent uppercase mb-1">Ditemukan</p>
                    <h3 className="font-bold text-lg text-slate-900 truncate uppercase">{scanResult.type}</h3>
                  </div>
                </div>
                <Button className="w-full h-14 rounded-2xl font-bold text-lg" onClick={() => router.push(scanResult.targetUrl)}>
                  Buka Konten <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="px-6 grid grid-cols-2 gap-4">
          <Button 
            variant={isCameraActive ? 'default' : 'outline'}
            className={cn("h-24 rounded-3xl flex-col gap-2 font-bold border-2", isCameraActive ? "bg-primary border-primary text-white" : "bg-white text-slate-600")}
            onClick={startCamera}
          >
            <Camera className="h-7 w-7" />
            <span className="text-[10px] uppercase">Kamera</span>
          </Button>
          <Button 
            variant="outline"
            className="h-24 rounded-3xl bg-white border-2 flex-col gap-2 font-bold text-slate-600"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-7 w-7" />
            <span className="text-[10px] uppercase">Galeri</span>
          </Button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </section>

        <section className="px-6 space-y-4 pb-10">
          <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" /> Riwayat Baru
          </h3>
          <div className="space-y-3">
            {recentScans?.map((log: any) => (
              <Card key={log.id} className="rounded-2xl border-none p-4 bg-white shadow-sm border border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 capitalize">{log.qrType}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{log.qrValue}</p>
                  </div>
                  <p className="text-[10px] font-bold text-accent">+{log.xpEarned} XP</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
