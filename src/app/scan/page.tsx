
'use client';

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  QrCode,
  FileText,
  ExternalLink,
  ClipboardList,
  AlertTriangle,
  Globe,
  Star,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment, addDoc, collection, serverTimestamp, query, where, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// Types for Universal Scanner
type ContentType = 'VIDEO' | 'KUIS' | 'FORMULIR' | 'PDF' | 'DOKUMEN' | 'INTERNAL' | 'WEBSITE' | 'PAYMENT_BLOCKED';

interface ScanResult {
  type: ContentType;
  title: string;
  url: string;
  xp: number;
  icon: any;
  buttonText: string;
}

const BLOCKED_KEYWORDS = [
  'qris', 'gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 
  'bca', 'bri', 'bni', 'mandiri', 'payment', 'transfer', 'merchant'
];

export default function UniversalScannerPage() {
  const router = useRouter();
  const { profile, user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const historyQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "scan_logs"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [db, user?.uid]);

  const { data: recentScans } = useCollection(historyQuery);

  // Lifecycle Management: Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = async () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop().catch(console.warn);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const classifyQR = (rawText: string): ScanResult => {
    const text = rawText.toLowerCase().trim();
    const decoded = decodeURIComponent(rawText);
    
    if (BLOCKED_KEYWORDS.some(k => text.includes(k))) {
      return {
        type: 'PAYMENT_BLOCKED',
        title: 'Pembayaran Tidak Didukung',
        url: '',
        xp: 0,
        icon: AlertTriangle,
        buttonText: 'Tutup'
      };
    }

    let isUrl = false;
    try {
      const urlObj = new URL(decoded);
      isUrl = ['http:', 'https:'].includes(urlObj.protocol);
    } catch (e) {
      isUrl = false;
    }

    if (text.startsWith('module:')) return {
      type: 'INTERNAL',
      title: 'Modul Nusantara',
      url: `/modules/${text.replace('module:', '')}`,
      xp: 10,
      icon: BookOpen,
      buttonText: 'Buka Modul'
    };
    if (text.startsWith('comic:')) return {
      type: 'INTERNAL',
      title: 'Komik Digital',
      url: `/komik/${text.replace('comic:', '')}`,
      xp: 15,
      icon: BookOpen,
      buttonText: 'Baca Komik'
    };
    if (text.startsWith('video:')) return {
      type: 'INTERNAL',
      title: 'Video Pembelajaran',
      url: `/video/${text.replace('video:', '')}`,
      xp: 5,
      icon: PlayCircle,
      buttonText: 'Tonton Video'
    };
    if (text.startsWith('ar:')) return {
      type: 'INTERNAL',
      title: 'Objek AR Budaya',
      url: `/ar-scan?id=${text.replace('ar:', '')}`,
      xp: 20,
      icon: Camera,
      buttonText: 'Lihat AR'
    };
    if (text.startsWith('quiz:')) return {
      type: 'INTERNAL',
      title: 'Kuis Evaluasi',
      url: `/modules/${text.replace('quiz:', '').split('/')[0]}/quiz`,
      xp: 20,
      icon: ClipboardList,
      buttonText: 'Mulai Kuis'
    };

    if (isUrl) {
      const url = decoded;
      if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
        return { type: 'VIDEO', title: 'Video Pembelajaran', url, xp: 0, icon: PlayCircle, buttonText: 'Buka Video' };
      }
      if (url.includes('wayground.com') || url.includes('quizizz.com') || url.includes('kahoot.com')) {
        return { type: 'KUIS', title: 'Kuis Interaktif', url, xp: 0, icon: ClipboardList, buttonText: 'Mulai Kuis' };
      }
      if (url.includes('forms.google.com') || url.includes('docs.google.com/forms')) {
        return { type: 'FORMULIR', title: 'Tugas / Formulir', url, xp: 0, icon: FileText, buttonText: 'Isi Form' };
      }
      if (url.toLowerCase().endsWith('.pdf')) {
        return { type: 'PDF', title: 'Modul Pembelajaran', url, xp: 0, icon: BookOpen, buttonText: 'Buka PDF' };
      }
      if (url.includes('docs.google.com')) {
        return { type: 'DOKUMEN', title: 'Dokumen Belajar', url, xp: 0, icon: FileText, buttonText: 'Buka Dokumen' };
      }
      return { type: 'WEBSITE', title: 'Website Edukasi', url, xp: 0, icon: Globe, buttonText: 'Kunjungi Situs' };
    }

    return {
      type: 'WEBSITE',
      title: 'Teks / Informasi',
      url: '',
      xp: 0,
      icon: ExternalLink,
      buttonText: 'Tutup'
    };
  };

  const handleQRAction = async (rawText: string, source: 'camera' | 'gallery') => {
    if (!db || !user || !profile) {
      setIsProcessing(false);
      return;
    }

    await stopCamera();
    const result = classifyQR(rawText);

    if (result.type === 'PAYMENT_BLOCKED') {
      setScanResult(result);
      setIsProcessing(false);
      return;
    }

    // Log for Scan Logs
    const logData = {
      userId: user.uid,
      studentName: profile.nama,
      qrType: result.type,
      title: result.title,
      url: result.url,
      source,
      xpEarned: result.xp,
      timestamp: serverTimestamp()
    };

    addDoc(collection(db, "scan_logs"), logData).catch(console.warn);

    // Log for Activity Log
    await addDoc(collection(db, "activities"), {
      userId: user.uid,
      activityType: "scan_qr",
      title: `Pindai QR: ${result.title}`,
      description: `Berhasil membuka konten edukasi via ${source}`,
      xp: result.xp,
      timestamp: serverTimestamp()
    }).catch(console.warn);

    if (result.xp > 0) {
      const userRef = doc(db, "users", user.uid);
      const newScanCount = (profile.scanCount || 0) + 1;
      const updatePayload: any = {
        poin: increment(result.xp),
        scanCount: increment(1)
      };

      if (newScanCount === 1) updatePayload.badges = arrayUnion("Explorer QR");
      else if (newScanCount === 10) updatePayload.badges = arrayUnion("Pemburu Pengetahuan");
      else if (newScanCount === 50) updatePayload.badges = arrayUnion("Master Eksplorasi");
      else if (newScanCount === 100) updatePayload.badges = arrayUnion("Legenda ETHNO");

      updateDoc(userRef, updatePayload).catch(console.warn);
      
      toast({
        title: "Berhasil!",
        description: `Mendapatkan +${result.xp} XP dari ${result.title}.`,
      });
    } else {
      updateDoc(doc(db, "users", user.uid), {
        scanCount: increment(1)
      }).catch(console.warn);
    }

    setScanResult(result);
    setIsProcessing(false);
  };

  const startCamera = async () => {
    try {
      setScanResult(null);
      await stopCamera();

      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (isProcessing) return;
          setIsProcessing(true);
          await handleQRAction(decodedText, 'camera');
        },
        () => {} 
      );
      setIsCameraActive(true);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Akses Kamera Gagal",
        description: "Pastikan Anda memberikan izin kamera.",
      });
      setIsCameraActive(false);
    }
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
        description: "Gunakan gambar QR Code yang lebih jelas.",
      });
      setIsProcessing(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openContent = () => {
    if (!scanResult) return;
    if (scanResult.url.startsWith('/')) {
      router.push(scanResult.url);
    } else if (scanResult.url) {
      window.open(scanResult.url, '_blank');
    }
    setScanResult(null);
  };

  const handleReset = () => {
    setScanResult(null);
    setIsProcessing(false);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 flex flex-col max-w-[500px] mx-auto overflow-y-auto transition-colors duration-500">
      <header className="sticky top-0 z-50 h-16 bg-white border-b flex items-center justify-between px-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="font-headline font-bold text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent fill-current" />
          Smart Scanner
        </h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-6">
        <div className={cn(
          "relative bg-slate-900 overflow-hidden shadow-inner w-full transition-all duration-500 ease-in-out",
          scanResult ? "h-[350px] bg-slate-100" : "aspect-square max-h-[50vh]"
        )}>
          <div id="reader" className={cn("w-full h-full", scanResult ? "hidden" : "block")}></div>
          <div id="reader-hidden" className="hidden"></div>
          
          {scanResult && (
            <div className="absolute inset-0 flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
              <Card className={cn(
                "w-full border-none rounded-[2.5rem] bg-white shadow-2xl overflow-hidden transform-gpu",
                scanResult.type === 'PAYMENT_BLOCKED' ? 'border-2 border-red-500/20' : 'border-2 border-accent/20'
              )}>
                <CardContent className="p-8 space-y-6 text-center">
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2",
                    scanResult.type === 'PAYMENT_BLOCKED' ? 'bg-red-50 text-red-500' : 'bg-accent/10 text-accent'
                  )}>
                    <scanResult.icon className="h-10 w-10" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{scanResult.type}</p>
                    <h3 className="font-headline font-bold text-xl text-slate-900 leading-tight">{scanResult.title}</h3>
                  </div>

                  {scanResult.xp > 0 && (
                    <div className="bg-yellow-50 px-4 py-2 rounded-2xl flex items-center justify-center gap-2 border border-yellow-100 w-fit mx-auto">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-yellow-700">+{scanResult.xp} XP Numerasi</span>
                    </div>
                  )}
                  
                  <div className="pt-4 space-y-3">
                    {scanResult.type !== 'PAYMENT_BLOCKED' ? (
                      <>
                        <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20" onClick={openContent}>
                          {scanResult.buttonText} <ChevronRight className="h-5 w-5 ml-2" />
                        </Button>
                        <Button variant="ghost" className="w-full h-12 rounded-2xl font-bold text-slate-400 gap-2" onClick={handleReset}>
                          <RefreshCw className="h-4 w-4" /> Scan Lagi
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2" onClick={handleReset}>
                        Kembali ke Scanner
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!isCameraActive && !isProcessing && !scanResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-8 text-center animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-2 border-dashed border-white/20">
                <Camera className="h-12 w-12 text-white/40" />
              </div>
              <p className="text-white/60 text-sm font-medium leading-relaxed px-10">
                Arahkan kamera ke QR Code pada modul, buku, atau video pembelajaran.
              </p>
              <Button size="lg" className="bg-accent hover:bg-accent/90 font-bold px-10 h-16 rounded-3xl shadow-xl transition-all active:scale-95" onClick={startCamera}>
                Aktifkan Kamera
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <p className="text-white font-bold tracking-wide">Menganalisis Konten Edukasi...</p>
            </div>
          )}
        </div>

        <section className="px-6 grid grid-cols-2 gap-4">
          <Button 
            variant={isCameraActive ? 'default' : 'outline'}
            className={cn(
              "h-24 rounded-[2rem] flex-col gap-2 font-bold border-2 transition-all active:scale-95", 
              isCameraActive ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white text-slate-600 shadow-sm border-slate-100"
            )}
            onClick={isCameraActive ? stopCamera : startCamera}
          >
            <Camera className="h-7 w-7" />
            <span className="text-[10px] uppercase tracking-wider">{isCameraActive ? 'Matikan' : 'Kamera'}</span>
          </Button>
          <Button 
            variant="outline"
            className="h-24 rounded-[2rem] bg-white border-2 border-slate-100 flex-col gap-2 font-bold text-slate-600 shadow-sm active:scale-95"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-7 w-7 text-accent" />
            <span className="text-[10px] uppercase tracking-wider">Galeri</span>
          </Button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </section>

        <section className="px-6 space-y-4 pb-12">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" /> Riwayat Baru
            </h3>
            <Link href="/activity" className="text-[10px] font-bold text-primary uppercase tracking-widest">Lihat Semua</Link>
          </div>
          
          <div className="space-y-3">
            {recentScans?.length ? recentScans.map((log: any) => (
              <Card key={log.id} className="rounded-3xl border-none p-4 bg-white shadow-sm border border-slate-50 active:scale-[0.98] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary">
                    <QrCode className="h-6 w-6 opacity-60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{log.title}</p>
                      <Badge variant="secondary" className="text-[8px] h-4 px-1 font-bold">{log.qrType}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate opacity-70">
                      {log.url && !log.url.startsWith('/') ? new URL(log.url).hostname : 'Materi Internal'}
                    </p>
                  </div>
                  {log.xpEarned > 0 && (
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-bold text-accent">+{log.xpEarned} XP</p>
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    </div>
                  )}
                </div>
              </Card>
            )) : (
              <div className="text-center py-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Belum ada riwayat pindaian.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
