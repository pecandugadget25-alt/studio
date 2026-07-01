'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationAiAssistant } from '@/components/ai/NavigationAiAssistant';
import { NavigationArCamera, type NavigationObject } from '@/components/ar/NavigationArCamera';

type NavigationSyntaxFeatureProps = {
  onComplete: (payload?: Record<string, unknown>) => void;
  onAiAssist: (prompt: string) => Promise<string>;
  comicTitle?: string;
  object?: NavigationObject;
};

const defaultObject: NavigationObject = {
  name: 'Kubus Candi Jawi',
  topic: 'Volume kubus dan balok',
  comic: 'Candi Jawi',
  marker: 'Marker komik halaman Navigation',
  description: 'Objek 3D ini membantu siswa mengamati sisi, rusuk, titik sudut, dan volume bangun ruang dari konteks Candi Jawi.',
};

export function NavigationSyntaxFeature({
  onComplete,
  onAiAssist,
  comicTitle = defaultObject.comic,
  object = defaultObject,
}: NavigationSyntaxFeatureProps) {
  const activeObject = { ...object, comic: comicTitle || object.comic };
  const [rotationCount, setRotationCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [aiInteractions, setAiInteractions] = useState(0);

  const handleZoom = () => {
    setZoomLevel((current) => (current >= 1.16 ? 1 : Number((current + 0.08).toFixed(2))));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-600">Navigation Syntax</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Scan. Explore. Ask.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Students scan the comic marker, inspect the 3D object, and use AI guidance only for the active comic, object, and mathematics topic.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <NavigationArCamera
          object={activeObject}
          rotationCount={rotationCount}
          zoomLevel={zoomLevel}
          showInfo={showInfo}
          onRotate={() => setRotationCount((current) => current + 1)}
          onZoom={handleZoom}
          onInfo={() => setShowInfo((current) => !current)}
        />
        <NavigationAiAssistant object={activeObject} onAiAssist={onAiAssist} onInteraction={() => setAiInteractions((current) => current + 1)} />
      </div>

      <div className="sticky bottom-[72px] z-10 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur md:bottom-0">
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={() => setRotationCount((current) => current + 1)}>
            Rotate
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={handleZoom}>
            Zoom
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={() => setShowInfo((current) => !current)}>
            Information
          </Button>
        </div>
      </div>

      <Button
        onClick={() =>
          onComplete({
            detectedObject: activeObject.name,
            mathematicsTopic: activeObject.topic,
            comic: activeObject.comic,
            aiInteractions,
            rotationCount,
            zoomLevel,
          })
        }
        className="h-14 w-full rounded-2xl bg-emerald-600 text-base font-bold hover:bg-emerald-700"
      >
        <CheckCircle2 className="mr-2 h-5 w-5" />
        Continue
      </Button>
    </div>
  );
}
