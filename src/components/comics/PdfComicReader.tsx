'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
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
        const maxWidth = Math.max(240, (containerRef.current?.clientWidth ?? 720) - 24);
        const scale = Math.min(2.4, Math.max(0.85, maxWidth / viewport.width));
        const scaledViewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Canvas tidak tersedia untuk merender halaman PDF.');
        }

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(scaledViewport.width * outputScale);
        canvas.height = Math.floor(scaledViewport.height * outputScale);
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;

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
  }, [pageNumber, totalPages]);

  const handlePageChange = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(1, nextPage), totalPages || 1);
    const reachedEnd = boundedPage >= totalPages;
    setPageNumber(boundedPage);
    onPageChangeRef.current(boundedPage, totalPages || 1, reachedEnd);
  };

  const goToPrevious = () => {
    if (pageNumber > 1) {
      handlePageChange(pageNumber - 1);
    }
  };

  const goToNext = () => {
    if (pageNumber < totalPages) {
      handlePageChange(pageNumber + 1);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] min-w-0 flex-col bg-[#f7f2e9] pb-24">
      <div className="mx-auto flex h-16 w-full max-w-[1000px] min-w-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-3 backdrop-blur sm:px-4">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-slate-900">{comicTitle}</p>
          <p className="text-xs text-slate-500">Page {pageNumber} / {totalPages}</p>
        </div>
        <Button variant="ghost" size="sm" className="h-9 rounded-full px-3 text-sm font-semibold text-slate-700" onClick={onExit}>
          Exit
        </Button>
      </div>

      <div ref={containerRef} className="mx-auto w-full max-w-[1000px] min-w-0 flex-1 bg-[#f7f2e9] px-3 py-3 sm:px-4 lg:px-0">
        <div className="relative flex h-[60vh] items-center justify-center rounded-lg border border-slate-200 bg-white p-1 shadow-inner md:h-[70vh] lg:h-[75vh]">
          <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden rounded-md bg-[#f3eee8] p-1 sm:p-2">
            <canvas ref={canvasRef} className="mx-auto block max-h-full max-w-full object-contain" />
          </div>

          {isLoading ? (
            <div className="absolute inset-1 flex flex-col items-center justify-center gap-3 rounded-md bg-white/90 text-sm font-semibold text-slate-500 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Memuat halaman komik...
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="absolute inset-1 flex items-center justify-center rounded-md bg-white/95 px-4 text-center text-sm text-red-500">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto grid w-full max-w-[1000px] grid-cols-2 gap-2 sm:gap-3">
          <Button variant="outline" className="h-14 rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-700" onClick={goToPrevious} disabled={pageNumber <= 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button className="h-14 rounded-lg bg-primary text-sm font-semibold text-white" onClick={goToNext} disabled={pageNumber >= totalPages}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
