'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function SmartScannerPage() {
  const router = useRouter();
  const { profile, user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [scanMethod, setScanMethod] = useState<'camera' | 'gallery'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scanMethod === 'camera' && !isProcessing) {
      startCamera();
    }
    return () => stopScanner();
  }, [scanMethod]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      const html5QrCode = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );
    } catch (err) {
      console.error(err);
      setError("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
      setIsScanning(false);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    await stopScanner();
    
    // Play success sound simulation
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {}

    await handleQRAction(decodedText, 'camera');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isProcessing) return;

    setIsProcessing(true);
    const html5QrCode = new Html5Qrcode("reader");
    
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleQRAction(decodedText, 'gallery');
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "QR Tidak Ditemukan",
        description: "Gambar tersebut tidak berisi QR Code yang valid.",
      });
      setIsProcessing(false);
    }
  };

  const handleQRAction = async (rawText: string, source: 'camera' | 'gallery') => {
    if (!db || !user || !profile) return;

    let type: 'video' | 'module' | 'comic' | 'quiz' | 'ar' | 'unknown' = 'unknown';
    let value = rawText;
    let xp = 0;
    let targetUrl = "";
    let actionLabel = "";

    // Validation & Parsing
    if (rawText.includes('youtube.com') || rawText.includes('youtu.be') || rawText.startsWith('video:')) {
      type = 'video';
      xp = 5;
      value = rawText.replace('video:', '');
      targetUrl = `/video/${encodeURIComponent(value)}`;
      actionLabel = "menonton video pembelajaran";
    } else if (rawText.startsWith('module:')) {
      type = 'module';
      xp = 3;
      value = rawText.replace('module:', '');
      targetUrl = `/modules/${value}`;
      actionLabel = "Membuka modul pembelajaran";
    } else if (rawText.startsWith('comic:')) {
      type = 'comic';
      xp = 2;
      value = rawText.replace('comic:', '');
      targetUrl = `/komik/${value}`;
      actionLabel = "Membaca komik digital";
    } else if (rawText.startsWith('quiz:')) {
      type = 'quiz';
      xp = 20;
      value = rawText.replace('quiz:', '');
      // Format quiz:module_id/quiz_id or just module_id
      const [modId] = value.split('/');
      targetUrl = `/modules/${modId}/quiz`;
      actionLabel = "Mengerjakan kuis interaktif";
    } else if (rawText.startsWith('ar:')) {
      type = 'ar';
      xp = 10;
      value = rawText.replace('ar:', '');
      targetUrl = `/ar-scan?id=${value}`;
      actionLabel = "Visualisasi AR 3D";
    }

    if (type === 'unknown') {
      toast({
        variant: "destructive",
        title: "QR Tidak Terdaftar",
        description: "QR Code ini tidak terdaftar pada sistem ETHNO-ARITH.",
      });
      setIsProcessing(false);
      setScanMethod('camera');
      return;
    }

    // Save Logs
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
      action: `berhasil memindai QR ${type}: ${value}`,
      type: 'scan',
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "scan_logs"), logData);
      await addDoc(collection(db, "activities"), activityData);
      
      // Update XP and Scan Count
      const userRef = doc(db, "users", user.uid);
      const newScanCount = (profile.scanCount || 0) + 1;
      
      const updatePayload: any = {
        poin: increment(xp),
        scanCount: increment(1)
      };

      // Gamification Badges
      if (newScanCount === 1) updatePayload.badges = arrayUnion("Explorer QR");
      if (newScanCount === 10) updatePayload.badges = arrayUnion("Pemburu Pengetahuan");
      if (newScanCount === 50) updatePayload.badges = arrayUnion("Master Eksplorasi");
      if (newScanCount === 100) updatePayload.badges = arrayUnion("Legenda ETHNO");

      await updateDoc(userRef, updatePayload);

      toast({
        title: "Scan Berhasil! 🎉",
        description: `Kamu mendapatkan +${xp} XP dari ${type}. Mengarahkan ke materi...`,
      });

      setTimeout(() => {
        router.push(targetUrl);
      }, 1500);

    } catch (err) {
      console.error("Failed to process scan data", err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative h-screen bg-black overflow-hidden flex flex-col max-w-[500px] mx-auto">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between pointer-events-none">
        <Link href="/" className="pointer-events-auto">
          <Button variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 text-white rounded-full h-12 w-12 p-0">
            <X className="h-6 w-6" />
          </Button>
        </Link>
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent fill-current" />
          <span className="text-sm font-bold uppercase tracking-tight text-white">Smart Scanner</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
        <div id="reader" className="w-full h-full"></div>
        
        {/* Scanning Overlay UI */}
        {isScanning && !isProcessing && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-xl" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent/40 animate-[scan_2s_ease-in-out_infinite] blur-sm" />
            </div>
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium uppercase tracking-widest text-center w-full">
              Posisikan QR Code di dalam kotak
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-accent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Memproses QR Code...</h3>
              <p className="text-white/40 text-sm">Menyinkronkan data dengan database ETHNO-ARITH</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-12 text-center space-y-6 z-20">
            <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-white text-xl font-bold">Kamera Terganggu</h2>
            <p className="text-white/60 text-sm leading-relaxed">{error}</p>
            <Button size="lg" className="w-full bg-primary" onClick={startCamera}>
              Coba Lagi
            </Button>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="h-32 bg-gradient-to-t from-black to-transparent absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 px-8 pb-8 z-20">
        <Button 
          variant={scanMethod === 'camera' ? 'default' : 'outline'} 
          className={cn(
            "flex-1 h-14 rounded-2xl gap-2 font-bold",
            scanMethod === 'camera' ? "bg-accent hover:bg-accent/90" : "bg-white/10 border-white/20 text-white"
          )}
          onClick={() => setScanMethod('camera')}
        >
          <Camera className="h-5 w-5" /> Kamera
        </Button>
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />
        
        <Button 
          variant={scanMethod === 'gallery' ? 'default' : 'outline'} 
          className={cn(
            "flex-1 h-14 rounded-2xl gap-2 font-bold",
            scanMethod === 'gallery' ? "bg-accent hover:bg-accent/90" : "bg-white/10 border-white/20 text-white"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5" /> Galeri
        </Button>
      </div>

      {/* Helper Info */}
      <div className="absolute top-24 left-6 right-6 z-10 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3">
          <div className="bg-accent/20 p-2 rounded-xl">
             <ShieldCheck className="h-4 w-4 text-accent" />
          </div>
          <p className="text-[10px] text-white/80 font-bold uppercase tracking-wide leading-tight">
            Scanner Resmi Terverifikasi <br /> <span className="text-white/40">Gunakan untuk materi fisik</span>
          </p>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}