'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CinaraiSessionData } from '@/components/cinarai/types';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfComicReaderProps {
  pdfUrl: string;
  session: CinaraiSessionData;
  onPageChange: (page: number, totalPages: number, readingCompleted: boolean) => void;
  onReadingComplete: (page: number, totalPages: number, readingCompleted: boolean) => void;
}

export function PdfComicReader({ pdfUrl, session, onPageChange, onReadingComplete }: PdfComicReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(Math.max(1, session.currentPage ?? 1));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const onPageChangeRef = useRef(onPageChange);
  const pageNumberRef = useRef(pageNumber);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  useEffect(() => {
    setPageNumber(Math.max(1, session.currentPage ?? 1));
  }, [session.currentPage]);

  const totalPages = numPages ?? session.totalPages ?? 1;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (pdfDocumentRef.current) {
          pdfDocumentRef.current = null;
        }

        const loadingTask = pdfjs.getDocument({
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

        const boundedPage = Math.min(Math.max(1, pageNumberRef.current), nextTotalPages);
        setPageNumber(boundedPage);
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
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
      if (pdfDocumentRef.current) {
        pdfDocumentRef.current = null;
      }
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

      const targetPage = Math.min(Math.max(1, pageNumberRef.current), totalPages || 1);
      setIsLoading(true);

      try {
        renderTaskRef.current?.cancel();
        const page = await pdf.getPage(targetPage);
        if (cancelled || targetPage !== pageNumberRef.current) {
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
        context.clearRect(0, 0, scaledViewport.width, scaledViewport.height);

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

  const readingCompleted = Boolean(session.readingCompleted);
  const progressPercent = totalPages > 0 ? Math.round((pageNumber / totalPages) * 100) : 0;
  const isAtLastPage = totalPages > 0 && pageNumber >= totalPages;
  const statusText = readingCompleted ? 'Komik selesai dibaca' : isAtLastPage ? 'Halaman terakhir tercapai' : 'Baca satu halaman per satu';

  const handlePageChange = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(1, nextPage), totalPages || 1);
    const reachedEnd = boundedPage >= totalPages;
    setPageNumber(boundedPage);
    onPageChangeRef.current(boundedPage, totalPages || 1, reachedEnd);
  };

  const handleContinueToContextualization = () => {
    const completedPage = Math.max(1, Math.min(pageNumber, totalPages || 1));
    onPageChangeRef.current(completedPage, totalPages || 1, true);
    onReadingComplete(completedPage, totalPages || 1, true);
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
    <div className="space-y-4">
      <Card className="rounded-[1.75rem] border-none bg-white p-4 shadow-lg shadow-orange-100/70">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BookOpen className="h-4 w-4 text-primary" />
          Pembaca Komik PDF
        </div>
        <p className="mt-2 text-sm text-slate-600">Satu halaman per satu halaman. Kamu tidak bisa scroll terus-menerus.</p>
      </Card>

      <Card className="rounded-[1.75rem] border-none bg-slate-50 p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          <span>Reading Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="mt-3 h-3" />
        <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Page {pageNumber} / {totalPages}</span>
          <span>{statusText}</span>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[2rem] border-none bg-white p-3 shadow-lg shadow-slate-200/80">
        <div ref={containerRef} className="flex min-h-[420px] items-center justify-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-2">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              Memuat halaman komik…
            </div>
          ) : error ? (
            <div className="max-w-full px-4 text-center text-sm text-red-500">{error}</div>
          ) : (
            <div className="w-full overflow-hidden rounded-[1.25rem] bg-white p-2">
              <canvas ref={canvasRef} className="mx-auto block max-w-full" />
            </div>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" className="h-14 rounded-[1.5rem] border-slate-200 bg-white text-base font-semibold text-slate-700 shadow-sm" onClick={goToPrevious} disabled={pageNumber <= 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button className="h-14 rounded-[1.5rem] bg-primary text-base font-semibold text-white shadow-lg shadow-orange-100/70" onClick={goToNext} disabled={pageNumber >= totalPages}>
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Card className="rounded-[1.75rem] border-none bg-gradient-to-br from-emerald-50 to-cyan-50 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>{readingCompleted ? 'Comic completed' : isAtLastPage ? 'Comic completed' : 'Baca sampai selesai untuk lanjut ke Contextualization'}</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{readingCompleted ? 'Kamu sudah menyelesaikan komik. Kamu bisa melanjutkan ke Contextualization.' : 'Selesaikan semua halaman untuk membuka tahap berikutnya.'}</span>
        </div>
        <Button className="mt-4 h-12 w-full rounded-[1.5rem] bg-emerald-600 text-base font-semibold text-white hover:bg-emerald-700" onClick={handleContinueToContextualization} disabled={!isAtLastPage && !readingCompleted}>
          Continue to Contextualization
        </Button>
      </Card>
    </div>
  );
}
