'use client';

import { Box, Info, Maximize, RotateCw, ScanLine, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type NavigationObject = {
  name: string;
  topic: string;
  comic: string;
  marker: string;
  description: string;
};

type NavigationArCameraProps = {
  object: NavigationObject;
  isScanning?: boolean;
  onRotate?: () => void;
  onZoom?: () => void;
  onInfo?: () => void;
  rotationCount?: number;
  zoomLevel?: number;
  showInfo?: boolean;
};

export function NavigationArCamera({
  object,
  isScanning = true,
  onRotate,
  onZoom,
  onInfo,
  rotationCount = 0,
  zoomLevel = 1,
  showInfo = false,
}: NavigationArCameraProps) {
  return (
    <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
            <ScanLine className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">AR Camera</p>
            <p className="truncate text-xs text-slate-300">{object.marker}</p>
          </div>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase',
            isScanning ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-100'
          )}
        >
          {isScanning ? 'Marker detected' : 'Scanning'}
        </span>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.28),transparent_36%),linear-gradient(135deg,#020617,#0f172a_45%,#111827)] p-5">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute left-5 top-5 h-14 w-14 rounded-tl-3xl border-l-2 border-t-2 border-blue-300/70" />
        <div className="absolute right-5 top-5 h-14 w-14 rounded-tr-3xl border-r-2 border-t-2 border-blue-300/70" />
        <div className="absolute bottom-5 left-5 h-14 w-14 rounded-bl-3xl border-b-2 border-l-2 border-blue-300/70" />
        <div className="absolute bottom-5 right-5 h-14 w-14 rounded-br-3xl border-b-2 border-r-2 border-blue-300/70" />

        <div
          className="relative flex aspect-square w-full max-w-[300px] items-center justify-center rounded-[2rem] border border-blue-200/20 bg-white/10 shadow-2xl shadow-blue-950/50 backdrop-blur transition-transform duration-500 ease-out"
          style={{ transform: `scale(${zoomLevel}) rotate(${rotationCount * 18}deg)` }}
        >
          <div className="absolute inset-8 rounded-[1.5rem] border border-white/10" />
          <Box className="h-28 w-28 text-blue-100 drop-shadow-lg" strokeWidth={1.4} />
          <Sparkles className="absolute right-14 top-14 h-5 w-5 text-cyan-200" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur">
          <p className="text-[11px] font-bold uppercase text-blue-200">3D Object</p>
          <h3 className="mt-0.5 text-lg font-bold leading-tight">{object.name}</h3>
          <p className="text-sm text-slate-300">{object.topic}</p>
        </div>
      </div>

      {showInfo ? (
        <div className="border-t border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200">
          {object.description}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 border-t border-white/10 bg-slate-900/95 p-3">
        <Button type="button" variant="secondary" className="h-12 rounded-2xl bg-white/10 text-white hover:bg-white/15" onClick={onRotate}>
          <RotateCw className="mr-2 h-4 w-4" />
          Rotate
        </Button>
        <Button type="button" variant="secondary" className="h-12 rounded-2xl bg-white/10 text-white hover:bg-white/15" onClick={onZoom}>
          <Maximize className="mr-2 h-4 w-4" />
          Zoom
        </Button>
        <Button type="button" variant="secondary" className="h-12 rounded-2xl bg-white/10 text-white hover:bg-white/15" onClick={onInfo}>
          <Info className="mr-2 h-4 w-4" />
          Info
        </Button>
      </div>
    </section>
  );
}
