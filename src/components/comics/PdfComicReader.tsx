'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CinaraiSessionData } from '@/components/cinarai/types';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

interface PdfComicReaderProps {
  pdfUrl: string;
  comicTitle: string;
  session: CinaraiSessionData;
  onPageChange: (page: number, totalPages: number, readingCompleted: boolean) => void;
  onReadingComplete: (page: number, totalPages: number, readingCompleted: boolean) => void;
  onExit: () => void;
}

export function PdfComicReader({ pdfUrl, comicTitle, session, onPageChange, onReadingComplete, onExit }: PdfComicReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(Math.max(1, session.currentPage ?? 1));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [pageTransition, setPageTransition] = useState<'idle' | 'next' | 'prev'>('idle');
  const [showChrome, setShowChrome] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved'>('saved');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const onPageChangeRef = useRef(onPageChange);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  useEffect(() => {
    setPageNumber(Math.max(1, session.currentPage ?? 1));
  }, [session.currentPage]);

  const totalPages = numPages ?? session.totalPages ?? 1;

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      setLayoutVersion((version) => version + 1);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;
    let loadingTask: ReturnType<typeof pdfjs.getDocument> | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);

      try {
        renderTaskRef.current?.cancel();
        renderTaskRef.current = null;
        pdfDocumentRef.current = null;

        loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          useWorkerFetch: false,
        });

        const pdf = await loadingTask.promise;
        if (cancelled) {
          return;
        }

        pdfDocumentRef.current = pdf;
        const nextTotalPages = pdf.numPages || 1;
        setNumPages(nextTotalPages);

        let boundedPage = 1;
        setPageNumber((currentPage) => {
          boundedPage = Math.min(Math.max(1, currentPage), nextTotalPages);
          return boundedPage;
        });

        onPageChangeRef.current(boundedPage, nextTotalPages, boundedPage >= nextTotalPages);
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Gagal memuat PDF komik.';
        setError(message);
        setIsLoading(false);
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy?.();
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      pdfDocumentRef.current = null;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const renderCurrentPage = async () => {
      const pdf = pdfDocumentRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas) {
        return;
      }

      const targetPage = Math.min(Math.max(1, pageNumber), totalPages || 1);
      setIsLoading(true);

      if (targetPage < 1 || targetPage > totalPages) {
        throw new Error(`Halaman ${targetPage} di luar batas 1-${totalPages}.`);
      }

      try {
        renderTaskRef.current?.cancel();
        renderTaskRef.current = null;

        const page = await pdf.getPage(targetPage);
        if (cancelled) {
          return;
        }

        const viewport = page.getViewport({ scale: 1 });
        const availableWidth = containerRef.current?.clientWidth ?? window.innerWidth;
        const availableHeight = containerRef.current?.clientHeight ?? window.innerHeight;
        const maxWidth = Math.max(1, availableWidth);
        const maxHeight = Math.max(1, availableHeight);
        // compute scale so the entire page fits without cropping, using viewport units and clamped scales
        const scale = Math.min(2.4, Math.max(0.25, Math.min(maxWidth / viewport.width, maxHeight / viewport.height)));
        const scaledViewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Canvas tidak tersedia untuk merender halaman PDF.');
        }

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.height = Math.floor(scaledViewport.height * outputScale);
        // let CSS control the visual size: use responsive width and auto height so pages never crop
        canvas.style.width = '100%';
        canvas.style.height = 'auto';

        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport: scaledViewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (!cancelled && targetPage === pageNumber) {
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled && targetPage === pageNumber) {
          const message = err instanceof Error ? err.message : 'Gagal merender halaman PDF.';
          setError(message);
          setIsLoading(false);
        }
      }
    };

    void renderCurrentPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [pageNumber, totalPages, layoutVersion]);

  const handlePageChange = (nextPage: number, direction: 'next' | 'prev' = 'next') => {
    const boundedPage = Math.min(Math.max(1, nextPage), totalPages || 1);
    const reachedEnd = boundedPage >= totalPages;
    setPageTransition(direction);
    setPageNumber(boundedPage);
    onPageChangeRef.current(boundedPage, totalPages || 1, reachedEnd);
  };

  const progressPercent = useMemo(() => {
    if (!totalPages || totalPages <= 1) return 0;
    return Math.round((pageNumber / totalPages) * 100);
  }, [pageNumber, totalPages]);

  const goToPrevious = () => {
    if (pageNumber > 1) {
      handlePageChange(pageNumber - 1, 'prev');
    }
  };

  const goToNext = () => {
    if (pageNumber < totalPages) {
      handlePageChange(pageNumber + 1, 'next');
    }
  };

  useEffect(() => {
    if (!totalPages || pageNumber < totalPages) return;

    const timeout = window.setTimeout(() => {
      setIsAutoAdvancing(true);
      onReadingComplete(pageNumber, totalPages, true);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [onReadingComplete, pageNumber, totalPages]);

  useEffect(() => {
    if (isLoading) {
      setShowChrome(true);
      return;
    }

    setShowChrome(true);
    const timer = window.setTimeout(() => setShowChrome(false), 2200);
    return () => window.clearTimeout(timer);
  }, [pageNumber, isLoading]);

  useEffect(() => {
    setSaveStatus('saving');
    const timer = window.setTimeout(() => setSaveStatus('saved'), 400);
    return () => window.clearTimeout(timer);
  }, [pageNumber]);

  const revealChrome = () => {
    setShowChrome(true);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[min(100%,1000px)] flex-col bg-[radial-gradient(circle_at_top,_#fbf6ee_0%,_#f3eadc_100%)]" style={{
      ['--reader-header-height' as any]: 'clamp(52px,6vh,60px)',
      ['--reader-footer-height' as any]: 'clamp(58px,6.4vh,66px)',
      width: 'min(100%,1000px)',
      margin: '0 auto',
      paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
      paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
    }}>
      <style jsx global>{`
        @keyframes comicPageEnter {
          0% {
            opacity: 0;
            transform: translate3d(0, 10px, 0) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>

      <div
        className={`flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/85 px-3 py-2 backdrop-blur transition-all duration-300 ${showChrome ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}
        style={{ minHeight: 'var(--reader-header-height)' }}
      >
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-slate-900">{comicTitle}</p>
          <p className="text-xs text-slate-500">Halaman {pageNumber} / {totalPages}</p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full px-3 text-sm font-semibold text-slate-700" onClick={onExit}>
          Keluar
        </Button>
      </div>

      <div className="flex-1 bg-transparent px-0 py-1 sm:px-1 sm:py-2">
        <div
          className="relative mx-auto flex h-full min-h-[72dvh] w-full max-w-[96%] items-center justify-center overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-[#f7efe3] shadow-[0_16px_45px_rgba(15,23,42,0.12)]"
          onClick={revealChrome}
          onPointerMove={revealChrome}
          onTouchStart={revealChrome}
        >
          <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,_#fdf6e8_0%,_#efe1cc_100%)] p-1 sm:p-2">
            <div key={`${pageNumber}-${layoutVersion}`} className="w-full max-w-full origin-center opacity-100 transition-all duration-300 ease-out" style={{ animation: 'comicPageEnter 280ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
              <div className="mx-auto max-w-[92%] rounded-[1.25rem] border border-slate-200/80 bg-white p-2 shadow-[0_16px_35px_rgba(15,23,42,0.12)] sm:p-3">
                <canvas ref={canvasRef} className="mx-auto block h-auto w-full object-contain" />
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
            <span>{pageNumber}</span>
            <span className="text-slate-300">/</span>
            <span>{totalPages}</span>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
            {progressPercent}%
          </div>

          <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
            {saveStatus === 'saving' ? 'Menyimpan…' : 'Tersimpan otomatis'}
          </div>

          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(255,252,246,0.9)] px-4 py-6 text-sm font-semibold text-slate-500 backdrop-blur-sm">
              <div className="w-full max-w-[18rem] rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                <div className="mb-3 h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="mb-2 h-44 animate-pulse rounded-[1rem] bg-[linear-gradient(90deg,_#f3e7d4_0%,_#f7efe3_50%,_#f3e7d4_100%)]" />
                <div className="flex gap-2">
                  <div className="h-2.5 flex-1 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-2.5 w-12 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 px-4 text-center text-sm text-red-500">
              {error}
            </div>
          ) : null}

          {isAutoAdvancing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-sm font-semibold text-white backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-2">
                <Sparkles className="h-4 w-4" />
                Melanjutkan ke Contextualization...
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`border-t border-slate-200/70 bg-white/85 px-2 py-2 backdrop-blur transition-all duration-300 ${showChrome ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`} style={{ minHeight: 'var(--reader-footer-height)' }}>
        <div className="mx-auto flex items-center gap-2">
          <Button variant="outline" className="flex-1 rounded-2xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm" onClick={goToPrevious} disabled={pageNumber <= 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Button>
          <Button className="flex-1 rounded-2xl bg-primary text-sm font-semibold text-white shadow-sm" onClick={goToNext} disabled={pageNumber >= totalPages}>
            Selanjutnya
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
